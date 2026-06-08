<table border="0" cellspacing="0" cellpadding="0">
<tr>
<td valign="middle" width="200" align="center">
  <img src="https://raw.githubusercontent.com/DisplayXR/.github/main/profile/DisplayXR-logo.png" width="160" alt="DisplayXR">
</td>
<td valign="middle">

**DisplayXR — OpenXR for spatial displays.** Write once, run on any spatial display. DisplayXR is an open extension standard and reference runtime that lets OpenXR applications target tracked stereo and multiview lightfield displays without vendor-specific code. Vendor-neutral by design: every display vendor integrates through the same plug-in boundary, and proven extensions are candidates for upstreaming into the official OpenXR specification.

🌐 [displayxr.org](https://displayxr.org) · 🚀 [Get started](https://displayxr.org/getting-started) · 🏛️ [Governance](https://displayxr.org/governance) · 🔌 [Vendor plug-in guide](https://displayxr.org/vendors)

End users install up to three components: **DisplayXR Runtime** (required, OpenXR runtime + service), **DisplayXR Shell** (optional, spatial workspace UX), and **DisplayXR MCP Tools** (optional, AI-agent / voice control). Each ships as a separate downloadable installer.

| | |
|---|---|
| [displayxr-extensions](https://github.com/DisplayXR/displayxr-extensions) | **The standard** — OpenXR extension specs for spatial displays (incl. spatial workspace + app launcher) |
| [displayxr-runtime](https://github.com/DisplayXR/displayxr-runtime) | Reference OpenXR runtime — native compositors for every graphics API, drivers |
| [displayxr-mcp](https://github.com/DisplayXR/displayxr-mcp) | Embeddable MCP server framework + **DisplayXR MCP Tools** installer (end-user opt-in for agent / voice control) |
| [displayxr-common](https://github.com/DisplayXR/displayxr-common) | Generalized off-axis frustum projection math library (`displayxr::math` + `displayxr::common`) |
| [displayxr-unity](https://github.com/DisplayXR/displayxr-unity) | Unity engine plugin |
| [displayxr-unity-test](https://github.com/DisplayXR/displayxr-unity-test) | Ready-to-open Unity test project for the plugin |
| [displayxr-unreal](https://github.com/DisplayXR/displayxr-unreal) | Unreal Engine plugin |
| [displayxr-demo-*](https://github.com/orgs/DisplayXR/repositories?q=displayxr-demo-) | One repo per demo application |
| &nbsp;&nbsp;↳ [displayxr-demo-gaussiansplat](https://github.com/DisplayXR/displayxr-demo-gaussiansplat) | Real-time 3D Gaussian Splatting viewer |
| [displayxr-shell-releases](https://github.com/DisplayXR/displayxr-shell-releases) | Reference spatial workspace controller (built on the workspace extensions) |

</td>
</tr>
</table>
