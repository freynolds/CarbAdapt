# design

`carbadapt-screens.html` is the screen source for the web app. It is the owner's export of every CarbAdapt frame: a single HTML file with fonts and board documents packed inside it.

Do not edit the packed file by hand. Replace it when a new export arrives, and re-run the unpack step described in `apps/web/README.md`.

The file is about 6 MB because each of the 17 boards embeds the same 11 font files plus a design-tool runtime. GitHub collapses the diff (`linguist-generated` in `.gitattributes`). The license comment at the top of the file covers Bricolage Grotesque, DM Sans, and JetBrains Mono under the SIL Open Font License. Keep that comment if you pass the file on.

Nothing in this folder is imported by Next.js or the API.
