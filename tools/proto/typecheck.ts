import {MsgPlayerUpdateGuildRank, MsgReactorInfuse, MsgProviderCreate, MsgAgreementOpen, MsgVaultSend} from '../../src/js/ts/structs.structs/types/structs/structs/tx';
import {AddressNonceRecord} from '../../src/js/ts/structs.structs/types/structs/structs/address';

const rank = MsgPlayerUpdateGuildRank.fromPartial({guildRank: '18446744073709551615'});
const exactRank: string = rank.guildRank;
// @ts-expect-error A 64-bit wire value must not be a JavaScript Number.
MsgPlayerUpdateGuildRank.fromPartial({guildRank: 1});
const reactor = MsgReactorInfuse.fromPartial({ownerId:'1-1', amount:{denom:'ualpha',amount:exactRank}});
const provider = MsgProviderCreate.fromPartial({ownerId:'0-1',capacityMaximum:exactRank});
const agreement = MsgAgreementOpen.fromPartial({ownerId:'1-1',duration:'10',capacity:exactRank});
const vault = MsgVaultSend.fromPartial({ownerId:'1-1',recipientOwnerId:'1-2',amount:[reactor.amount!]});
const nonce: string = AddressNonceRecord.fromPartial({nonce:exactRank}).nonce;
void [provider,agreement,vault,nonce];
