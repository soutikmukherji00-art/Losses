# Subagent playbook — FE Loss Report Card prototype work

Read this before spawning any subagent for this project. Goal: never burn tokens on an
open-ended subagent task. Every delegated task must be small enough that the agent can
finish it in one pass and report a short, structured result.

## Rules

1. **One JTBD per agent call.** "Extract color tokens from Figma frame 2" is a valid task.
   "Build the new tab" is not — that's a multi-step job the coordinator (main thread) breaks
   down and drives itself, editing files directly, not via a subagent.
2. **No subagent does Figma fetching + spec writing + code editing in one call.** Split by
   phase (see `PROGRESS.md`). The coordinator owns sequencing and integration.
3. **Bound the output.** Tell the agent the exact file(s) to write/read and a line/word cap
   on its report. Never ask a fresh agent to "explore" this repo — it's small enough that the
   coordinator already knows the layout (see `PROGRESS.md` for the file map).
4. **Prefer doing it yourself over delegating** when the task requires holding a lot of
   cross-file context (e.g. reconciling Figma tokens against the prototype's existing
   `<style>` tokens) — that reconciliation judgment call is the coordinator's job.
5. **Large file reads:** the prototype HTML is ~1.2MB (a Claude Design bundler export). Never
   `Read` it whole. Use `offset`/`limit`, or `grep -n` to find the section first, then read a
   bounded range. The actual editable markup lives inside a JS string in a
   `<script type="__bundler/template">` block — edits must go through that escaped string
   (see `Design System/VISUAL_DESIGN_SPEC.md` decode note), not through naive text search on
   raw file bytes, because content is `\n`/`\"`-escaped there.
6. **After any subagent call, update `PROGRESS.md`** (the phase checkbox + a one-line note in
   the decisions log) before moving on, so a context wipe or usage-limit cutoff doesn't lose
   the thread.

## Edit procedure — the ONLY safe way to change the WIP prototype's content

The WIP `.html` is a Claude-Design canvas bundle. The real markup+logic lives inside a JSON-encoded
JS string in `<script type="__bundler/template">`. Do NOT attempt naive find/replace on the raw file
bytes — the content is JSON-escaped (`\n`, `\"`) and edits will not land where you expect.

**Do this, in order, every time:**

1. Decode cleanly with `json.loads` — NOT `unicode_escape`, NOT any manual `.encode()/.decode()`
   trick. (`unicode_escape` was tried once and silently corrupted every non-ASCII character — em
   dashes, ₹ symbols typed literally rather than as `\u` escapes — into mojibake. `json.loads` is the
   only decode that is provably correct; it's what the runtime itself uses.)
   ```python
   import json
   data = open(WIP_PATH, encoding='utf-8').read()
   marker = '__bundler/template">'
   i = data.index(marker) + len(marker)
   i2 = data.index('\n', i) + 1
   j = data.index('\n  </script>', i2)
   template = json.loads(data[i2:j])
   open('template_clean.html', 'w', encoding='utf-8').write(template)
   ```
2. Edit `template_clean.html` with normal tools (Read/Edit) — it's real, correctly-decoded HTML+JS at
   this point, ~100-120KB, well within a normal Read.
3. Validate before splicing anything back:
   - `<sc-if>`/`<sc-for>` open/close counts must match (`grep -c`).
   - Extract the `<script type="text/x-dc" ...>` block's JS body (find `data-props=` then the next
     `>`, up to the matching `</script>`) and run `node --check` on it.
4. Splice back — re-encode with `json.dumps(..., ensure_ascii=False)`, then replicate the bundle's own
   escaping convention (it protects the outer `<script>` tag boundary by escaping every literal `</`
   to `</` — verify this is still the convention before relying on it, by checking
   `data.count('<\\u002Fdiv>')` vs `data.count('</div>')` in the ORIGINAL file):
   ```python
   new_json_str = json.dumps(edited_template, ensure_ascii=False).replace('</', '<\\u002F')
   new_data = data[:i2] + new_json_str + data[j:]
   open(WIP_PATH, 'w', encoding='utf-8').write(new_data)
   ```
5. **Always round-trip verify** after writing: re-extract + `json.loads` the file you just wrote and
   assert it equals `edited_template` character-for-character. Also byte-diff everything outside the
   `i2:j` span against the pre-edit file to confirm nothing else moved (manifest, fonts, bootstrap
   script must be byte-identical).
6. Update `PROGRESS.md` (phase checkbox + a decisions-log line) with what changed and the verification
   result, before ending the task.

Skipping step 5 is how silent corruption ships — it costs nothing to check and the failure mode
(mojibake, or a broken bootstrap script) is otherwise invisible until someone opens the file in a
browser.

## Escalation

If a task turns out to need exploration (e.g. "where in the template does the tab bar render"),
that's a *quick lookup* — do it directly with Grep/Bash, not a subagent. Reserve subagents for
work that would otherwise flood the coordinator's context with raw output it won't need again
(e.g. a bulk decode-and-summarize of Figma JSON).
