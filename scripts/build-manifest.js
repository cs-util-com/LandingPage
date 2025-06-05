const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const core = require('@actions/core');
const github = require('@actions/github');

async function getRepoContents(owner, repo, repoPath = '') {
    const octokit = new Octokit({ 
        // auth: process.env.GITHUB_TOKEN // Use GITHUB_TOKEN if available for higher rate limits
        // For unauthenticated requests, be mindful of rate limits.
    });
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: repoPath,
        });
        return data;
    } catch (error) {
        core.error(`Error fetching content for path: ${repoPath}`);
        core.error(error);
        // If a directory is not found or other error, return empty array to allow processing other parts
        if (error.status === 404) {
            console.warn(`Warning: Path not found in repo: ${repoPath}. Skipping.`);
            return [];
        }
        throw error; // Re-throw for other critical errors
    }
}

async function getAllFiles(owner, repo, directory = '') {
    let results = [];
    const items = await getRepoContents(owner, repo, directory);

    if (!Array.isArray(items)) {
        core.warning(`Expected an array of items for directory '${directory}', but received: ${typeof items}. Skipping this path.`);
        return results; // Return empty if not an array (e.g. single file path was given by mistake or API error)
    }

    for (const item of items) {
        if (item.type === 'file') {
            results.push({
                path: item.path,
                name: item.name,
                sha: item.sha,
                size: item.size,
                download_url: item.download_url,
                type: item.type,
            });
        } else if (item.type === 'dir') {
            results = results.concat(await getAllFiles(owner, repo, item.path));
        }
    }
    return results;
}

async function run() {
    try {
        const context = github.context;
        const repoOwner = context.repo.owner;
        const repoName = context.repo.repo;

        core.info(`Fetching repository content for ${repoOwner}/${repoName}...`);
        const allFiles = await getAllFiles(repoOwner, repoName);
        core.info(`Found ${allFiles.length} files and directories.`);

        const manifestPath = path.resolve(process.cwd(), 'repo-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(allFiles, null, 2));
        core.info(`repo-manifest.json generated successfully at ${manifestPath}`);

    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

// Create dummy posts directory and files for local testing of blog functionality
function createDummyPostsForLocalTesting() {
    const postsDir = path.resolve(process.cwd(), 'posts');
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
    }

    const dummyPosts = [
        {
            name: '2025-01-15-my-first-post.html',
            content: '<!DOCTYPE html><html><head><title>First Post</title></head><body><h1>My First Blog Post</h1><p>This is a test.</p></body></html>'
        },
        {
            name: '2025-02-10-another-cool-topic.html',
            content: '<!DOCTYPE html><html><head><title>Cool Topic</title></head><body><h1>Another Cool Topic</h1><p>More content here.</p></body></html>'
        },
        {
            name: '2024-12-20-older-thoughts.html',
            content: '<!DOCTYPE html><html><head><title>Older Thoughts</title></head><body><h1>Older Thoughts</h1><p>Some reflections.</p></body></html>'
        }
    ];

    dummyPosts.forEach(post => {
        fs.writeFileSync(path.join(postsDir, post.name), post.content);
    });
    console.log('Dummy posts created for local testing in ./posts/');
}

if (process.env.NODE_ENV === 'local_test') {
    // Example usage for local testing (not part of GitHub Action execution)
    // You would need to set GITHUB_TOKEN or ensure the repo is public
    // and manually provide owner/repo if not in an Action context.
    console.log('Running in local test mode for build-manifest.js');
    createDummyPostsForLocalTesting(); 
    // To fully test locally, you might mock github.context or pass owner/repo directly
    // For now, this setup primarily helps test the dummy post creation and basic script structure.
    // The main `run()` function is designed for GitHub Actions environment.
    // To test `run()` locally: github.context.repo.owner = 'your_gh_username'; github.context.repo.repo = 'your_repo_name'; run();
} else {
    run();
}
