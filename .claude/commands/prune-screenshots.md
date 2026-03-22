---
description: Prune redundant screenshots and convert non-WebP images to WebP
argument-hint: [path-or-description]
---

<objective>
Review all screenshots in a directory, identify visually redundant ones, convert non-WebP images to WebP, present a keep/delete recommendation to the user, then delete the approved files.
</objective>

<process>
1. **Resolve the screenshot directory**
   - If `$ARGUMENTS` is a valid directory path, use it directly
   - If `$ARGUMENTS` describes where to find screenshots (e.g. "phase 06"), search for matching directories using Glob
   - If `$ARGUMENTS` is empty or ambiguous, use AskUserQuestion to ask the user which screenshots to prune

2. **Check WebP tooling and list screenshots**
   - Run `which cwebp` once to check if WebP conversion is available
   - Run `ls -la` on the directory to see all image files with timestamps and sizes
   - Note the file count and which files are non-WebP (png, jpg, jpeg)

3. **View every screenshot**
   - Read ALL image files (webp, png, jpg) using the Read tool
   - Process them in batches of ~7 to stay within tool limits
   - Do NOT skip any files -- every image must be visually inspected

4. **Analyze and categorize**
   For each screenshot, note:
   - What distinct UI state it captures
   - Whether it shows a unique interaction moment (mid-drag, input visible, completed state, etc.)
   - Whether it's a "starting state" that duplicates a previous test's result
   - Whether it's near-identical to another screenshot

   Common redundancy patterns:
   - **Starting states** that match the previous test's ending state (e.g. `03-start` looks identical to `02-result`)
   - **Result states** that match a prior state after toggling back (e.g. unchecked -> checked -> unchecked, the final unchecked matches the original)
   - **Multiple captures** of the same visual state with slightly different names
   - **Before/after pairs** where both sides look identical (e.g. persistence tests)

5. **Present recommendations**
   Show two tables:
   - **KEEP** -- files with distinct visual states, with a brief note on what each shows
   - **DELETE** -- redundant files, with a brief note on why (which kept file it duplicates)

   Ask the user to confirm before proceeding.

6. **Delete approved files**
   - Use `rm` to delete the confirmed files
   - Report the final count (deleted vs remaining)

7. **Convert remaining non-WebP images to WebP**
   - Skip this step if `cwebp` was not found in step 2
   - For each remaining png/jpg/jpeg file: `cwebp -q 80 {file}.png -o {file}.webp && rm {file}.png`
   - Report how many files were converted
</process>

<success_criteria>
- Every screenshot in the directory was visually inspected via the Read tool before making recommendations
- Recommendations distinguish truly unique visual states from redundant captures
- User explicitly confirms before any files are deleted
- Keep/delete rationale references specific visual differences, not just filenames
- No unique visual state is lost -- when in doubt, keep
- All remaining non-WebP images converted to WebP (if cwebp is available)
</success_criteria>
