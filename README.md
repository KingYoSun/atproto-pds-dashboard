# ATProto PDS Dashboard

## Contents

- [Overview](#overview)
- [Features](#features)

## Overview

This repo is the administration dashboard of PDS in [bluesky-social/atproto](https://github.com/bluesky-social/atproto).

Everything in this repo is an work in progress!

## Usage

If you use local PDS (dev-env etc.), do the following first.

1. Clone [bluesky-social/atproto](https://github.com/bluesky-social/atproto)
2. `make run-dev-env` at bluesky-social/atproto

And do below in this repo.

```
yarn install
yarn dev
```

Then, access `http://localhost:3000` .

In the dashboard, Authenticate as admin or moderator. If PDS is dev-env, host is `http://localhost:2583` , username is `admin` , password is `admin-pass` .

Then, Login as user of the PLC server. This is needed to know the DID of the admin or moderator, and to exec `getPostThread` .

## Features

Features of below is based on `com.atproto.admin.*` of [lexicon](https://atproto.com/lexicons/com-atproto-admin).

- getRecord
- getRepo
- getModerationReport(s)
- takeModerationAction
- getModerationAction(s)
- resolveModerationReports
- reverseModerationAction
- (TODO) disableAccountInvites
- (TODO) disableInviteCodes
- (TODO) enableAccountInvites
- (TODO) getInviteCodes
- (TODO) rebaseRepo
- (TODO) searchRepos
- (TODO) sendEmail
- (TODO) updateAccountEmail
- (TODO) updateAccountHandle

## Demo

https://atproto-pds-dashboard.vercel.app/
