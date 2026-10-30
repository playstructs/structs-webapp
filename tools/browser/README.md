# Native browser screen acceptance

This development fixture loads the actual application shell, styles, view models,
router, queue, offline signer and browser storage. API and native outcomes are
controlled. It makes no RPC connection or chain broadcast, and uses a public
test mnemonic. It is excluded from production webpack entries. It is intended
for a dedicated disposable localhost origin, never the user's served webapp.

Build into the temporary JS directory already mounted by a disposable Apache:

```sh
STRUCTS_NODE_MODULES=/path/to/node_modules NODE_PATH=/path/to/node_modules \
  node tools/browser/build.cjs /temporary/preview/js http://127.0.0.1:PORT
```

Open the returned URL and exercise the real controls. `case` names an isolated
scenario: changing it clears only this dedicated origin's fixture state;
reloading the same case preserves its signed journal and queue. `screen=confirm`
starts at the existing confirmation for one Alpha to player 1-2.

Edit `acceptance-control.json` in the temporary directory to control responses:
`fundsReady`, `prepareFailure`, `outcome` (`success`, `reject`, `unknown`) and
`indexReady`. `transactionDelayMs` delays the details read to test navigation
while a response is pending. The fixture deliberately finishes that response
even after cancellation, checking the view's guard as well as request aborts.
No fixture controls are added to product screens. Console records
prefixed `[acceptance-state]` expose counters and original queue IDs; signed
message identity is recorded as `[acceptance-signing]`.

Check fresh/blocked spendability, selected player versus explicit address,
definitive rejection with the original amount/recipient, uncertain send across
reload, delayed indexing without notifications, and departure before completion.
Save screenshots and console evidence. These browser checks supplement the
authenticated Apache/proxy tests and real release-app/native simulation tests;
they do not prove the live deployment or end-to-end wallet authentication.

For an uncertain send, reload the same case and press the transfer control
again. The queue must retain its original ID with `signed=1` and `sends=1`.
Switching `outcome` to `success` lets that same transaction reconcile. This
checks duplicate prevention; the forced confirmation entry does not exercise
the normal application's menu/session restoration.
