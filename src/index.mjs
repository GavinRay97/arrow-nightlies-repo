// index.mjs
// Run with: $ node index.mjs
import fetch from "cross-fetch"
import fs from "fs"
import { JSDOM } from "jsdom"
import path from "path"
import { fileURLToPath } from "url"

// Polyfill "__dirname" for Node.js ECMAScript Module filetype
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ARROW_NIGHTLY_TAG_URL =
    "https://github.com/ursacomputing/crossbow/releases/tag/nightly-packaging-2022-04-06-0-github-java-jars"

extractArrowNightlyJarsToLocalM2Repo(ARROW_NIGHTLY_TAG_URL)
    .then(() => console.log("Done"))
    .catch((err) => console.error(err))

async function extractArrowNightlyJarsToLocalM2Repo(arrowNightlyTagUrl) {
    // Parse HTML to DOM
    const dom = await JSDOM.fromURL(arrowNightlyTagUrl)
    const document = dom.window.document

    // Get all <li> tags containing the asset name and download URL
    const assetLinkEls = document.querySelectorAll("li.Box-row")
    const assets = []
    for (const el of assetLinkEls) {
        const anchorTag = el.querySelector("a")
        const assetFilename = anchorTag.textContent.trim()
        const link = anchorTag.href
        if (assetFilename.includes("Source code")) continue
        const { library, version } = getLibraryAndVersionFromAssetFilename(assetFilename)
        assets[library] ??= []
        assets[library].push({ version, link, assetFilename })
    }

    const promises = []
    for (const [library, versions] of Object.entries(assets)) {
        for (const { version, link, assetFilename } of versions) {
            const libPath = `m2repo/org/apache/arrow/${library}/${version}`
            const m2RepoPath = path.join(__dirname, "../", libPath)
            await fs.promises.mkdir(m2RepoPath, { recursive: true })
            const filepath = path.join(m2RepoPath, assetFilename)
            console.log("Downloading", assetFilename, "to", filepath)
            promises.push(downloadUrlAssetToPath(link, filepath))
        }
    }
    return Promise.all(promises)
}

// Fetches HTML content from URL and saves it to file at path
async function downloadUrlAssetToPath(url, filepath) {
    const request = await fetch(url)
    const fileStream = fs.createWriteStream(filepath)
    return new Promise((resolve, reject) => {
        request.body.pipe(fileStream)
        request.body.on("error", reject)
        fileStream.on("finish", resolve)
    })
}

// M2 repo folder format:
// org/apache/arrow/<lib-name>/<version>/<lib-name>-<version>.(jar/xml)
function getLibraryAndVersionFromAssetFilename(filename) {
    const libraryAndVersionRegex = /(?<library>.+)-(?<version>\d\.\d\.\d.dev\d+)/
    return filename.match(libraryAndVersionRegex)?.groups
}
