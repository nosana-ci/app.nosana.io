<template>
  <section class="section">
    <div class="container">
      <div v-if="commit">
        <div class="is-flex is-align-items-center">
          <div class="mr-4">
            <nuxt-link :to="`/repositories/${commit.repository_id}`" class="is-size-5">
              <i class="fas fa-chevron-left" />
            </nuxt-link>
          </div>
          <div class="mr-4">
            <div
              class="tag is-small"
              :class="{
                'is-success': commit.status === 'COMPLETED',
                'is-info': commit.status === 'RUNNING',
                'is-danger': commit.status === 'FAILED'
              }"
            >
              {{ getStatus(commit) }}
            </div>
          </div>
          <div>Job <b>#{{ commit.id }}</b> triggered by <a target="_blank" :href="'https://github.com/'+commit.payload.author.username">{{ commit.payload.author.name }}</a> {{ $moment(commit.created_at).fromNow() }}</div>
        </div>
        <hr class="my-4">
        <h1 class="title">
          {{ commit.payload.message.split('\n')[0] }}
        </h1>
        <div class="box">
          <div v-if="commit.job" class="mb-4">
            <i class="fas fa-list mr-4 has-text-accent" />Smart Contract Job <a target="_blank" :href="$sol.explorer + '/address/' + commit.job" class="blockchain-address-inline">{{ commit.job }}</a>
          </div>
          <div v-if="commit.job && commit.jobInfo" class="mb-4">
            <i class="fas fa-coins mr-4 has-text-accent" />Pipeline total cost <b class="has-text-accent">{{ parseInt(commit.jobInfo.tokens, 16) }} NOS</b>
          </div>
          <div v-if="commit.job && commit.jobInfo && commit.jobInfo.jobStatus > 0" class="mb-4">
            <i class="fas fa-server mr-4 has-text-accent" />Node: <b>{{ commit.jobInfo.node }}</b>
          </div>
          <div class="has-overresult-ellipses">
            <i class="fab fa-git mr-4 has-text-accent" />Commit <a :href="commit.payload.url" target="_blank" @click.stop>{{ commit.commit }}</a>
          </div>
          <span style="white-space: pre-wrap">{{ commit.payload.message }}</span>
        </div>
        <div v-if="!commit.job" class="level notification is-warning">
          <div class="level-left">
            <div class="level-item">
              <span>Not posted to blockchain yet..</span>
            </div>
          </div>
          <div v-if="user && (user.roles.includes('admin'))" class="level-right">
            <div class="level-item">
              <button class="button is-small is-danger" @click="postJob(commit.id)">
                Retry transaction
              </button>
            </div>
          </div>
        </div>
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': tab === 'result'}">
              <a @click.prevent="tab='result'">Result</a>
            </li>
            <li :class="{'is-active': tab === 'logs'}">
              <a @click.prevent="tab='logs'">Job Info</a>
            </li>
            <li :class="{'is-active': tab === 'payload'}">
              <a @click.prevent="tab='payload'">Payload</a>
            </li>
          </ul>
        </div>
        <div v-if="tab === 'result'">
          <div v-if="!result">
            No result yet..
          </div>
          <div v-for="op in result.ops" v-else :key="op.id" class="box is-info">
            <div class="is-clickable is-flex is-flex-wrap-wrap is-align-items-center" @click="step !== op.id ? step = op.id : step = null">
              <h3 class="subtitle m-0">
                {{ op.title }}
              </h3>
              <div class="is-size-7 has-overresult-ellipses mr-4" style="margin-left: auto">
                was ran by <a :href="`https://explorer.solana.com/address/${'7E5nsBVPuPoRBsDzVjr2YKFNoqewo2EGitKq7cbhSSp4'}`" target="_blank">7E5nsBVPuPoRBsDzVjr2YKFNoqewo2EGitKq7cbhSSp4</a>
              </div>
              <div>
                <i class="fas fa-chevron-down" :class="{'fa-chevron-up': step === op.id}" />
              </div>
            </div>
            <div v-if="step === op.id">
              <div v-if="op.op === 'nos.git/ensure-repo'">
                <pre>Cloning into {{ result.results[op.id] }}</pre>
              </div>
              <div v-else-if="op.op === 'sh'">
                <pre v-if="result.results[op.id]">{{ result.results[op.id].out }}</pre>
                <div v-else>
                  Op is still pending
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="tab === 'logs'">
          <pre>{{ commit.jobInfo }}</pre>
        </div>
        <div v-else-if="tab === 'payload'">
          <pre>{{ commit.payload }}</pre>
        </div>
      </div>
      <div v-else>
        Loading..
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      commit: null,
      result: null,
      step: null,
      tab: 'result',
      user: null
    }
  },
  watch: {
    '$sol.token' (token) {
      if (token) {
        this.getUser()
      }
    }
  },
  created () {
    this.getCommit(this.$route.params.id)
    if (this.$sol && this.$sol.token) {
      this.getUser()
    }
  },
  methods: {
    getStatus (commit) {
      let status = commit.status
      if (commit.jobInfo) {
        switch (commit.jobInfo.jobStatus) {
          case 0:
            status = 'QUEUED'
            break
          case 1:
            status = 'RUNNING'
            break
          case 2:
            status = 'COMPLETED'
            break
        }
      }
      return status
    },
    async getUser () {
      try {
        const user = await this.$axios.$get(`${process.env.backendUrl}/user`)
        this.user = user
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async postJob (id) {
      try {
        await this.$axios.$post(`${process.env.backendUrl}/commits/${id}/job`)
        this.getCommit(id)
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    async getCommit (id) {
      try {
        const commit = await this.$axios.$get(`${process.env.backendUrl}/commits/${id}`)
        this.commit = commit
        // this.getResult(this.commit.id)
      } catch (error) {
        this.$modal.show({
          color: 'danger',
          text: error,
          title: 'Error'
        })
      }
    },
    getResult (id) {
      this.result = {
        id: 'EaaxIhragGiIOvaWoR985',
        'execution-path': [],
        results: {
          input: {
            html_url: 'https://github.com/solana-labs/solana/commit/d896ff74ec33ff92f08b2fee61d55fbcdac55dff',
            committer: {
              html_url: 'https://github.com/mvines',
              gravatar_id: '',
              followers_url: 'https://api.github.com/users/mvines/followers',
              subscriptions_url: 'https://api.github.com/users/mvines/subscriptions',
              site_admin: false,
              following_url: 'https://api.github.com/users/mvines/following{/other_user}',
              node_id: 'MDQ6VXNlcjEyODEwODI=',
              type: 'User',
              received_events_url: 'https://api.github.com/users/mvines/received_events',
              login: 'mvines',
              organizations_url: 'https://api.github.com/users/mvines/orgs',
              id: 1281082,
              events_url: 'https://api.github.com/users/mvines/events{/privacy}',
              url: 'https://api.github.com/users/mvines',
              repos_url: 'https://api.github.com/users/mvines/repos',
              starred_url: 'https://api.github.com/users/mvines/starred{/owner}{/repo}',
              gists_url: 'https://api.github.com/users/mvines/gists{/gist_id}',
              avatar_url: 'https://avatars.githubusercontent.com/u/1281082?v=4'
            },
            node_id: 'C_kwDOBz19r9oAKGQ4OTZmZjc0ZWMzM2ZmOTJmMDhiMmZlZTYxZDU1ZmJjZGFjNTVkZmY',
            author: {
              html_url: 'https://github.com/mvines',
              gravatar_id: '',
              followers_url: 'https://api.github.com/users/mvines/followers',
              subscriptions_url: 'https://api.github.com/users/mvines/subscriptions',
              site_admin: false,
              following_url: 'https://api.github.com/users/mvines/following{/other_user}',
              node_id: 'MDQ6VXNlcjEyODEwODI=',
              type: 'User',
              received_events_url: 'https://api.github.com/users/mvines/received_events',
              login: 'mvines',
              organizations_url: 'https://api.github.com/users/mvines/orgs',
              id: 1281082,
              events_url: 'https://api.github.com/users/mvines/events{/privacy}',
              url: 'https://api.github.com/users/mvines',
              repos_url: 'https://api.github.com/users/mvines/repos',
              starred_url: 'https://api.github.com/users/mvines/starred{/owner}{/repo}',
              gists_url: 'https://api.github.com/users/mvines/gists{/gist_id}',
              avatar_url: 'https://avatars.githubusercontent.com/u/1281082?v=4'
            },
            comments_url: 'https://api.github.com/repos/solana-labs/solana/commits/d896ff74ec33ff92f08b2fee61d55fbcdac55dff/comments',
            commit: {
              tree: {
                url: 'https://api.github.com/repos/solana-labs/solana/git/trees/c6e8c2cd57394e690035eb555a5132fd17175976',
                sha: 'c6e8c2cd57394e690035eb555a5132fd17175976'
              },
              committer: {
                email: 'mvines@gmail.com',
                date: '2021-12-21T16:30:36Z',
                name: 'Michael Vines'
              },
              verification: {
                payload: null,
                signature: null,
                reason: 'unsigned',
                verified: false
              },
              author: {
                email: 'mvines@gmail.com',
                date: '2021-12-21T02:16:46Z',
                name: 'Michael Vines'
              },
              comment_count: 0,
              url: 'https://api.github.com/repos/solana-labs/solana/git/commits/d896ff74ec33ff92f08b2fee61d55fbcdac55dff',
              message: 'Remove Apple M1 resolver workaround'
            },
            parents: [
              {
                html_url: 'https://github.com/solana-labs/solana/commit/ba8e15848e5b7d52cce133e541e92c5aec361a6a',
                url: 'https://api.github.com/repos/solana-labs/solana/commits/ba8e15848e5b7d52cce133e541e92c5aec361a6a',
                sha: 'ba8e15848e5b7d52cce133e541e92c5aec361a6a'
              }
            ],
            url: 'https://api.github.com/repos/solana-labs/solana/commits/d896ff74ec33ff92f08b2fee61d55fbcdac55dff',
            files: [
              {
                additions: 0,
                raw_url: 'https://github.com/solana-labs/solana/raw/d896ff74ec33ff92f08b2fee61d55fbcdac55dff/Cargo.toml',
                contents_url: 'https://api.github.com/repos/solana-labs/solana/contents/Cargo.toml?ref=d896ff74ec33ff92f08b2fee61d55fbcdac55dff',
                patch: '@@ -85,8 +85,3 @@ members = [\n exclude = [\n     "programs/bpf",\n ]\n-\n-# TODO: Remove once the "simd-accel" feature from the reed-solomon-erasure\n-# dependency is supported on Apple M1. v2 of the feature resolver is needed to\n-# specify arch-specific features.\n-resolver = "2"',
                blob_url: 'https://github.com/solana-labs/solana/blob/d896ff74ec33ff92f08b2fee61d55fbcdac55dff/Cargo.toml',
                filename: 'Cargo.toml',
                status: 'modified',
                deletions: 5,
                changes: 5,
                sha: '6f33ee6816f89e1cec74620ad171ea3e3d3cd5b9'
              }
            ],
            stats: {
              additions: 0,
              total: 5,
              deletions: 5
            },
            sha: 'd896ff74ec33ff92f08b2fee61d55fbcdac55dff'
          },
          clone: '/tmp/repos/solana',
          'sanity-check': {
            exit: 0,
            out: "--- git diff --check\n\n--- ci/nits.sh\n--- git --no-pager grep -n -eprint! -eprintln! -eeprint! -eeprintln! -edbg! -- :core/src/**.rs :^core/src/validator.rs :faucet/src/**.rs :ledger/src/**.rs :metrics/src/**.rs :net-utils/src/**.rs :runtime/src/**.rs :sdk/bpf/rust/rust-utils/**.rs :sdk/**.rs :^sdk/cargo-build-bpf/**.rs :^sdk/program/src/program_option.rs :^sdk/program/src/program_stubs.rs :programs/**.rs :^**bin**.rs :^**bench**.rs :^**test**.rs :^**/build.rs\n--- git --no-pager grep -n Default::default() -- *.rs\n--- git --no-pager grep -n --max-depth=0 -e XXX -e TBD -e FIXME -- *.rs *.sh *.md\n--- git --no-pager grep -n --max-depth=0 -e TODO -- *.rs *.sh *.md\nci/nits.sh:64:  #T\\ODO  # TODO: Disable TODOs once all other TODOs are purged\nci/nits.sh:71:# TODO: Remove this `git grep` once TODOs are banned above\nci/nits.sh:73:_ git --no-pager grep -n --max-depth=0 \"-e TODO\" -- '*.rs' '*.sh' '*.md' || true\nci/nits.sh:75:# END TODO\nclient/src/pubsub_client.rs:105:        // TODO: Add proper JSON RPC response/error handling...\nclient/src/pubsub_client.rs:140:        // TODO: Add proper JSON RPC response/error handling...\ncore/benches/retransmit_stage.rs:42:// TODO: The benchmark is ignored as it currently may indefinitely block.\ncore/src/ancestor_hashes_service.rs:392:            // TODO: In the case of DuplicateAncestorDecision::ContinueSearch\ncore/src/banking_stage.rs:825:        // TODO: Banking stage threads should be prioritized to complete faster then this queue\ncore/src/banking_stage.rs:1964:                // TODO use record_receiver\ncore/src/broadcast_stage.rs:220:                | Error::ClusterInfo(ClusterInfoError::NoPeers) => (), // TODO: Why are the unit-tests throwing hundreds of these?\ncore/src/broadcast_stage/standard_broadcast_run.rs:503:        // TODO: Confirm that last chunk of coding shreds\ncore/src/cluster_slots_service.rs:167:        // TODO: Should probably incorporate slots that were replayed on startup,\ncore/src/consensus.rs:328:        // TODO: populate_ancestor_voted_stakes only adds zeros. Comment why\ncore/src/consensus.rs:621:                // TODO: Handle if the last vote is on a dupe, and then we restart. The dupe won't be in\ncore/src/consensus.rs:638:                        // TODO: Properly handle this case\ncore/src/duplicate_repair_status.rs:114:    // TODO: Trie may be more efficient\ncore/src/latest_validator_votes_for_frozen_banks.rs:9:    // TODO: Clean outdated/unstaked pubkeys from this list.\ncore/src/repair_weight.rs:114:                    // TODO: Repair right now does not distinguish between votes for different\ncore/src/repair_weighted_traversal.rs:97:        // like duplicate slots. TODO: Account for duplicate slot may be in orphans, especially\ncore/src/replay_stage.rs:948:        // TODO: handle if alternate version of descendant also got confirmed after ancestor was\ncore/src/replay_stage.rs:1015:                // TODO: Send signal to repair to repair the correct version of\ncore/src/replay_stage.rs:1150:            // TODO: What about RPC queries that had already cloned the Bank for this slot\ncore/src/replay_stage.rs:1898:        // TODO: check the timestamp in this vote is correct, i.e. it shouldn't\ncore/src/retransmit_stage.rs:270:        // TODO: consider using root-bank here for leader lookup!\ncore/src/verified_vote_packets.rs:52:        // TODO: my_leader_bank.vote_accounts() may not contain zero-staked validators\ncore/src/verified_vote_packets.rs:75:        // TODO: Maybe prioritize by stake weight\nentry/src/entry.rs:420:    // TODO: make the CPU-to GPU crossover point dynamic, perhaps based on similar future\nentry/src/entry.rs:422:    // is introduced for that function (see TODO in sigverify::ed25519_verify)\ngossip/src/cluster_info.rs:118:// TODO: Update this to 26 once payload sizes are upgraded across fleet.\ngossip/src/cluster_info.rs:263:// TODO These messages should go through the gpu pipeline for spam filtering\ngossip/src/cluster_info.rs:272:    // TODO: Remove the redundant outer pubkey here,\ngossip/src/cluster_info.rs:496:    // TODO kill insert_info, only used by tests\ngossip/src/cluster_info.rs:830:    // TODO: This has a race condition if called from more than one thread.\ngossip/src/cluster_info.rs:853:    // TODO: If two threads call into this function then epoch_slot_index has a\ngossip/src/cluster_info.rs:1005:        // TODO: When there are more than one vote evicted from the tower, only\ngossip/src/cluster_info.rs:1686:                // TODO: Stakes are comming from the root-bank. Debug why/when\ngossip/src/cluster_info.rs:2631:                                // TODO: Pass through Exit here so\ngossip/src/cluster_info.rs:4486:    #[ignore] // TODO: debug why this is flaky on buildkite!\ngossip/src/contact_info.rs:192:        // TODO: boot loopback in production networks\ngossip/src/contact_info.rs:205:    // TODO: Replace this entirely with streamer SocketAddrSpace.\ngossip/src/crds_value.rs:34:// TODO: Remove this in favor of vote_state::MAX_LOCKOUT_HISTORY once\ngossip/src/crds_value.rs:146:        // TODO: Implement other kinds of CrdsData here.\ngossip/src/crds_value.rs:147:        // TODO: Assign ranges to each arm proportional to their frequency in\ngossip/src/duplicate_shred.rs:89:        // TODO: Should also allow two coding shreds with different indices but\ngossip/src/ping_pong.rs:78:        // TODO Add self.token.sanitize()?; when rust's\ngossip/src/weighted_shuffle.rs:199:// TODO: Remove in favor of rand::distributions::WeightedIndex.\ngossip/tests/cluster_info.rs:127:            // TODO: Ideally these should use the new methods in\nledger/src/blockstore.rs:1026:        // TODO should also compare first-coding-index once position field is\nledger/src/blockstore.rs:1080:        // TODO: handle_duplicate is not invoked and so duplicate shreds are\nledger/src/blockstore.rs:1462:        // TODO Shouldn't this use shred.parent() instead and update\nledger/src/blockstore.rs:1989:                // TODO: add support for versioned transactions\nledger/src/blockstore.rs:2291:            // TODO: support retrieving versioned transactions\nledger/src/blockstore/blockstore_purge.rs:338:                    // TODO: support purging mapped addresses from versioned transactions\nledger/src/blockstore_meta.rs:261:        // TODO remove this once cluster is upgraded to always populate\nledger/src/blockstore_meta.rs:280:        // TODO remove this once cluster is upgraded to always populate\nledger/src/shred.rs:507:            // TODO should be: self.index() - self.coding_header.position\nledger/src/shred.rs:544:                // TODO should use first_coding_index once position field is\nledger/src/shred.rs:874:                        // TODO: tie this more closely with\nperf/src/packet.rs:115:                // TODO: This should never happen. Instead the caller should\nperf/src/sigverify.rs:527:    // TODO: dynamically adjust this crossover\npoh/src/poh_recorder.rs:451:        // TODO: adjust the working_bank.start time based on number of ticks\npoh/src/poh_recorder.rs:561:                // TODO: a caller could possibly desire to reset or record while we're spinning here\nprogram-runtime/src/native_loader.rs:184:            // TODO: Remove these two copies (* deref is also a copy)\nprogram-test/src/lib.rs:235:        // TODO: Merge the business logic below with the BPF invoke path in\nprogram-test/src/lib.rs:246:        // TODO don't have the caller's keyed_accounts so can't validate writer or signer escalation or deescalation yet\nprogram-test/src/lib.rs:337:                    // TODO Figure out a better way to allow the System Program to set the account owner\nprogram-test/src/lib.rs:344:                // TODO: Figure out how to allow the System Program to resize the account data\nprogram-test/src/lib.rs:675:            // TODO: figure out why tests hang if a processor panics when running native code.\nprograms/bpf_loader/src/lib.rs:369:                    return Err(InstructionError::Immutable); // TODO better error code\nprograms/config/src/lib.rs:23:// TODO move ConfigState into `solana_program` to implement trait locally\nprograms/vote/src/vote_instruction.rs:50:    // TODO: figure out how to migrate these new errors\nprograms/vote/src/vote_state/mod.rs:705:            // TODO to think about: Note, people may be incentivized to set more\nrpc/src/rpc.rs:1422:            // TODO: Add bigtable_ledger_storage support as a part of\nrpc/src/rpc.rs:2370:        // TODO: Refactor `solana-validator wait-for-restart-window` to not require this method, so\nrpc/src/rpc.rs:2379:        // TODO: Refactor `solana-validator wait-for-restart-window` to not require this method, so\nrpc/src/rpc.rs:2499:        // TODO: Refactor `solana-validator wait-for-restart-window` to not require this method, so\nrpc/src/rpc.rs:2510:        // TODO: Refactor `solana-validator wait-for-restart-window` to not require this method, so\nrpc/src/rpc_service.rs:152:        // TODO: Is there any way to achieve the same on Windows?\nruntime/src/accounts_db.rs:2422:        // TODO: coalesce `purge_stats` and `reclaim_result` together into one option, as they\nruntime/src/accounts_index.rs:1168:        // TODO: expand to use mint index to find the `pubkey_list` below more efficiently\nruntime/src/bank.rs:1386:            // TODO: clean this up, so much special-case copying...\nruntime/src/bank.rs:3620:                            // TODO: support versioned messages\nruntime/src/bank.rs:8594:        // TODO: Transactions that fail to pay a fee could be dropped silently.\nruntime/src/bank.rs:9614:        // TODO: if we need to access rooted banks older than this,\nruntime/src/bank.rs:9633:        // TODO: if we need to access rooted banks older than this,\nruntime/src/builtins.rs:163:        // TODO when feature `prevent_calling_precompiles_as_programs` is\nruntime/src/commitment.rs:109:        // TODO: combine bank caches\nscripts/build-downstream-projects.sh:56:    # TODO: Build src/program-c/...\nstreamer/src/socket.rs:23:        // TODO: remove these once IpAddr::is_global is stable.\nstreamer/src/socket.rs:26:                // TODO: Consider excluding:\nstreamer/src/socket.rs:33:                // TODO: Consider excluding:\nvalidator/src/admin_rpc_service.rs:81:            // TODO: Debug why Exit doesn't always cause the validator to fully exit\nvalidator/src/bin/solana-test-validator.rs:377:    // TODO: Ideally test-validator should *only* allow private addresses.\nvalidator/src/main.rs:2047:    // TODO: Once entrypoints are updated to return shred-version, this should\n^^^ +++\n--- ci/check-ssh-keys.sh\n--- channel version check\nSkipped. CHANNEL_LATEST_TAG (CHANNEL=) unset\n--- ok\n",
            err: "+ [[ -n '' ]]\n+ branch=master\n+ git fetch origin master\nFrom https://github.com/solana-labs/solana\n * branch                master     -> FETCH_HEAD\n++ git merge-base HEAD origin/master\n+ git diff d896ff74ec33ff92f08b2fee61d55fbcdac55dff --check --oneline\n"
          },
          'channel-info': {
            exit: 0,
            out: 'EDGE_CHANNEL=master\nBETA_CHANNEL=v1.9\nBETA_CHANNEL_LATEST_TAG=v1.9.1\nSTABLE_CHANNEL=v1.8\nSTABLE_CHANNEL_LATEST_TAG=v1.8.11\nCHANNEL=\nCHANNEL_LATEST_TAG=\n',
            err: ''
          }
        },
        title: 'solana-labs/solana',
        description: 'Run the pipeline',
        'sample-input': {
          sha: '522062350b5358973c77919b4d1b6a43d30a36f6',
          commit: {
            message: 'Add commit message'
          }
        },
        ops: [
          {
            op: 'nos.git/ensure-repo',
            id: 'clone',
            title: 'Clone repository',
            args: [
              'https://github.com/solana-labs/solana.git',
              '/tmp/repos/solana'
            ],
            deps: []
          },
          {
            op: 'sh',
            id: 'sanity-check',
            title: 'Check: sanity',
            args: [
              '/bin/sh',
              '-c',
              'cd /tmp/repos/solana && ./ci/test-sanity.sh'
            ],
            deps: [
              'clone'
            ]
          },
          {
            op: 'sh',
            id: 'channel-info',
            title: 'Channel info',
            args: [
              '/bin/sh',
              '-c',
              'cd /tmp/repos/solana && ./ci/channel-info.sh'
            ],
            deps: [
              'clone'
            ]
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
