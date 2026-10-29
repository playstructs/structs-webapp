// Run from a temporary checkout of the pinned chain release; see README.md.
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strings"

	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	"github.com/cosmos/cosmos-sdk/types/tx"
	"github.com/cosmos/gogoproto/jsonpb"
	"github.com/cosmos/gogoproto/proto"
	_ "structs/x/structs/types"
)

type fixture struct {
	Release  string `json:"release"`
	SignedTx string `json:"signed_tx"`
	Messages []struct {
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
	signDoc := tx.SignDoc{BodyBytes: raw.BodyBytes, AuthInfoBytes: raw.AuthInfoBytes, ChainId: "structstestnet-111", AccountNumber: 0}
	signBytes, err := proto.Marshal(&signDoc)
	must(err)
	if !publicKey.VerifySignature(signBytes, raw.Signatures[0]) {
		panic("offline signature did not verify")
	}
	fmt.Println("verified offline signature with release SDK; no broadcast")
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}
