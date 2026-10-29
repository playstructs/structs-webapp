// Run from a temporary checkout of the pinned chain release; see README.md.
package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/cosmos/cosmos-sdk/codec"
	codecTypes "github.com/cosmos/cosmos-sdk/codec/types"
	cryptoCodec "github.com/cosmos/cosmos-sdk/crypto/codec"
	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/tx"
	"github.com/cosmos/cosmos-sdk/x/auth/ante"
	authTx "github.com/cosmos/cosmos-sdk/x/auth/tx"
	"github.com/cosmos/gogoproto/jsonpb"
	"github.com/cosmos/gogoproto/proto"
	structsTypes "structs/x/structs/types"
)

type fixture struct {
	Release       string `json:"release"`
	SignedTx      string `json:"signed_tx"`
	AccountNumber string `json:"account_number"`
	TimeoutHeight string `json:"timeout_height"`
	Messages      []struct {
		TypeURL  string         `json:"type_url"`
		Expected map[string]any `json:"expected"`
	} `json:"messages"`
}

func main() {
	if len(os.Args) != 2 {
		panic("usage: verify-wire fixture.json")
	}
	data, err := os.ReadFile(os.Args[1])
	must(err)
	var f fixture
	must(json.Unmarshal(data, &f))
	if f.Release != "96cea3a322c406b46ca1feb880dc4497ebd9353f" {
		panic("wrong fixture release")
	}
	wire, err := base64.StdEncoding.DecodeString(f.SignedTx)
	must(err)
	var raw tx.TxRaw
	must(proto.Unmarshal(wire, &raw))
	var body tx.TxBody
	must(proto.Unmarshal(raw.BodyBytes, &body))
	if len(body.Messages) != len(f.Messages) {
		panic("message count mismatch")
	}
	for i, expected := range f.Messages {
		actual := body.Messages[i]
		if actual.TypeUrl != expected.TypeURL {
			panic("message type mismatch")
		}
		typeOf := proto.MessageType(strings.TrimPrefix(actual.TypeUrl, "/"))
		if typeOf == nil {
			panic("unknown release message: " + actual.TypeUrl)
		}
		message := reflect.New(typeOf.Elem()).Interface().(proto.Message)
		must(proto.Unmarshal(actual.Value, message))
		encoded, err := (&jsonpb.Marshaler{EmitDefaults: true}).MarshalToString(message)
		must(err)
		var decoded map[string]any
		must(json.Unmarshal([]byte(encoded), &decoded))
		for key, value := range expected.Expected {
			if !reflect.DeepEqual(decoded[key], value) {
				panic(fmt.Sprintf("%s.%s: got %#v; expected %#v", actual.TypeUrl, key, decoded[key], value))
			}
		}
		fmt.Println("verified release decode", actual.TypeUrl)
	}
	var auth tx.AuthInfo
	must(proto.Unmarshal(raw.AuthInfoBytes, &auth))
	if len(auth.SignerInfos) != 1 || len(raw.Signatures) != 1 {
		panic("expected one offline signer")
	}
	var publicKey secp256k1.PubKey
	must(proto.Unmarshal(auth.SignerInfos[0].PublicKey.Value, &publicKey))
	var accountNumber uint64
	if f.AccountNumber != "" {
		accountNumber, err = strconv.ParseUint(f.AccountNumber, 10, 64)
		must(err)
	}
	signDoc := tx.SignDoc{BodyBytes: raw.BodyBytes, AuthInfoBytes: raw.AuthInfoBytes, ChainId: "structstestnet-111", AccountNumber: accountNumber}
	signBytes, err := proto.Marshal(&signDoc)
	must(err)
	if !publicKey.VerifySignature(signBytes, raw.Signatures[0]) {
		panic("offline signature did not verify")
	}
	fmt.Println("verified offline signature with release SDK; no broadcast")
	if f.TimeoutHeight != "" {
		if f.TimeoutHeight != "3352999" || body.TimeoutHeight != 3352999 {
			panic("wrong signed upgrade expiry")
		}
		interfaces := codecTypes.NewInterfaceRegistry()
		cryptoCodec.RegisterInterfaces(interfaces)
		structsTypes.RegisterInterfaces(interfaces)
		config := authTx.NewTxConfig(codec.NewProtoCodec(interfaces), authTx.DefaultSignModes)
		decoded, err := config.TxDecoder()(wire)
		must(err)
		for _, height := range []int64{3352999, 3353000} {
			reached := false
			_, err := ante.NewTxTimeoutHeightDecorator().AnteHandle(sdk.Context{}.WithBlockHeight(height), decoded, false,
				func(ctx sdk.Context, _ sdk.Tx, _ bool) (sdk.Context, error) { reached = true; return ctx, nil })
			if height == 3352999 && (err != nil || !reached) {
				panic("H-1 was incorrectly expired")
			}
			if height == 3353000 && (!errors.Is(err, sdkerrors.ErrTxTimeoutHeight) || reached) {
				panic("H was not expired")
			}
		}
		fmt.Println("verified actual queued signed body with SDK timeout decorator: H-1 passes, H expires; no handler/broadcast claim")
	}
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}
