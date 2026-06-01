# Passwordless auth email template

Paste the same HTML below into both Supabase dashboard templates:

- **Authentication → Email Templates → Magic Link / OTP → Message body**
- **Authentication → Email Templates → Confirm sign up → Message body**

Using the same template for both slots makes new-account and existing-account sign-in behave like one passwordless flow instead of sending a different-looking signup email first.

Suggested **Subject** for both templates: `Your First Things First sign-in link`

## Required URL configuration

Because this template uses `{{ .SiteURL }}` in the link, Supabase Auth URL
Configuration must match the deployment before production sign-in works:

- **Site URL**: the canonical production app origin, for example
  `https://first-things-first-five.vercel.app` (no trailing slash).
- **Redirect URLs**: include the production origin/path pattern used by
  `emailRedirectTo`, for example `https://first-things-first-five.vercel.app/**`.
- Keep local development allowed separately, for example `http://localhost:3000/**`
  and `http://127.0.0.1:3000/**`.
- If using Vercel preview deployments for auth testing, add the preview wildcard,
  for example `https://*-roland-tolnays-projects.vercel.app/**`.

If Site URL is left as localhost, production emails will contain localhost magic
links even when the OTP request is sent from Vercel.

> ⚠️ **Do not change the `href`.** The link
> `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`
> is the functional contract with our `/auth/confirm` route (`src/app/auth/confirm/route.ts`)
> — it carries the `token_hash`, `type`, and `next` the route reads. Restyle freely
> around it, but keep that URL and its query params intact (it appears twice below:
> the button and the copy-paste fallback).

This is a Pareto pass over the bare defaults: a branded header, a real button, a card
container, and a copy-paste fallback URL (so a stripped button never locks anyone out).
Intentionally left out as long-tail: Outlook VML button hacks, a dark-mode variant, and
a hosted logo image. The layout is light + table-based for broad client compatibility.

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr>
          <td style="padding-bottom:24px;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:5px;background:#f59e0b;vertical-align:middle;"></span>
            <span style="font-size:15px;font-weight:600;color:#18181b;vertical-align:middle;padding-left:8px;">First Things First</span>
          </td>
        </tr>
        <tr>
          <td style="font-size:20px;font-weight:600;color:#18181b;padding-bottom:8px;">
            Continue to First Things First
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;line-height:22px;color:#52525b;padding-bottom:24px;">
            Click the button below to continue. This link expires shortly and can only be used once.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px;">
            <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
               style="display:inline-block;background:#f59e0b;color:#18181b;font-size:14px;font-weight:600;text-decoration:none;padding:11px 24px;border-radius:8px;">
              Continue
            </a>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;line-height:20px;color:#71717a;padding-bottom:6px;">
            Or paste this URL into your browser:
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;line-height:18px;padding-bottom:24px;word-break:break-all;">
            <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
               style="color:#a16207;text-decoration:underline;">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #f4f4f5;padding-top:16px;font-size:12px;line-height:18px;color:#a1a1aa;">
            If you didn't request this email, you can safely ignore it.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```
