#!/usr/bin/env node
/**
 * UOR-R4 Sovereign AI - Local MCP (Model Context Protocol) Bridge Daemon
 * Zero external dependencies: Uses pure Node.js built-in modules (http, crypto, fs, child_process, https).
 * 
 * Provides:
 * 1. Local PC Filesystem & Terminal Execution Tools (read_file, write_file, list_directory, execute_command, git_status, git_diff)
 * 2. GitHub API Tools (github_get_file, github_create_or_update_file, github_list_issues, github_create_issue, github_create_pull_request)
 * 3. Standard MCP JSON-RPC 2.0 WebSocket & HTTP Server on localhost:3000
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const WORKSPACE_DIR = process.cwd();

// --- MCP TOOL DEFINITIONS ---
const MCP_TOOLS = [
    {
        name: 'read_file',
        description: 'Read the text contents of a file from the local workspace.',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Relative or absolute file path to read' }
            },
            required: ['path']
        }
    },
    {
        name: 'write_file',
        description: 'Create or overwrite a file in the local workspace with new content.',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Relative or absolute file path to write to' },
                content: { type: 'string', description: 'The complete text content to write' }
            },
            required: ['path', 'content']
        }
    },
    {
        name: 'list_directory',
        description: 'List all files and subdirectories in a folder within the local workspace.',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Directory path to list (default: current workspace root)' }
            }
        }
    },
    {
        name: 'execute_command',
        description: 'Run a shell command on the local machine within the workspace and capture stdout/stderr.',
        inputSchema: {
            type: 'object',
            properties: {
                command: { type: 'string', description: 'Shell command string to execute (e.g. "cargo test", "npm run build")' }
            },
            required: ['command']
        }
    },
    {
        name: 'git_status',
        description: 'Get the current git status and list modified or untracked files.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'git_diff',
        description: 'Get the current unstaged and staged git diff of the repository.',
        inputSchema: {
            type: 'object',
            properties: {
                file: { type: 'string', description: 'Optional specific file to diff' }
            }
        }
    },
    {
        name: 'github_get_file',
        description: 'Fetch the raw content of a file from a GitHub repository via GitHub API.',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Repository owner (e.g. "Casey-allard")' },
                repo: { type: 'string', description: 'Repository name (e.g. "uor-r4-wasm-chat")' },
                path: { type: 'string', description: 'File path in the repository' },
                branch: { type: 'string', description: 'Branch name (default: "main")' }
            },
            required: ['owner', 'repo', 'path']
        }
    },
    {
        name: 'github_create_or_update_file',
        description: 'Commit and push a file directly to a GitHub repository.',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' },
                path: { type: 'string', description: 'File path in repository' },
                content: { type: 'string', description: 'File content to commit' },
                message: { type: 'string', description: 'Git commit message' },
                branch: { type: 'string', description: 'Target branch (default: "main")' }
            },
            required: ['owner', 'repo', 'path', 'content', 'message']
        }
    },
    {
        name: 'github_list_issues',
        description: 'List open issues or pull requests from a GitHub repository.',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' },
                state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state (default: "open")' }
            },
            required: ['owner', 'repo']
        }
    },
    {
        name: 'github_create_issue',
        description: 'Create a new issue on a GitHub repository.',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' },
                title: { type: 'string', description: 'Issue title' },
                body: { type: 'string', description: 'Issue description markdown' }
            },
            required: ['owner', 'repo', 'title', 'body']
        }
    },
    {
        name: 'github_create_pull_request',
        description: 'Open a new Pull Request on a GitHub repository.',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' },
                title: { type: 'string', description: 'Pull Request title' },
                head: { type: 'string', description: 'Branch containing your changes' },
                base: { type: 'string', description: 'Target branch to merge into (default: "main")' },
                body: { type: 'string', description: 'Pull Request description' }
            },
            required: ['owner', 'repo', 'title', 'head']
        }
    }
];

// --- TOOL HANDLER IMPLEMENTATION ---
async function handleToolCall(name, args, githubToken = '') {
    const resolvePath = (p) => path.isAbsolute(p) ? p : path.resolve(WORKSPACE_DIR, p);

    switch (name) {
        case 'read_file': {
            const target = resolvePath(args.path);
            if (!fs.existsSync(target)) {
                throw new Error(`File not found: ${args.path}`);
            }
            const content = fs.readFileSync(target, 'utf8');
            return content;
        }

        case 'write_file': {
            const target = resolvePath(args.path);
            const parentDir = path.dirname(target);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(target, args.content, 'utf8');
            return `Successfully written ${args.content.length} characters to ${args.path}`;
        }

        case 'list_directory': {
            const target = resolvePath(args.path || '.');
            if (!fs.existsSync(target)) {
                throw new Error(`Directory not found: ${args.path || '.'}`);
            }
            const entries = fs.readdirSync(target, { withFileTypes: true });
            const list = entries.map(e => ({
                name: e.name,
                type: e.isDirectory() ? 'directory' : 'file',
                size: e.isFile() ? fs.statSync(path.join(target, e.name)).size : 0
            }));
            return JSON.stringify(list, null, 2);
        }

        case 'execute_command': {
            return new Promise((resolve, reject) => {
                exec(args.command, { cwd: WORKSPACE_DIR, timeout: 30000 }, (error, stdout, stderr) => {
                    let out = '';
                    if (stdout) out += stdout;
                    if (stderr) out += (out ? '\n--- STDERR ---\n' : '') + stderr;
                    if (error) {
                        out += `\n[Process exited with code ${error.code || 1}]`;
                    }
                    resolve(out || '(No output returned)');
                });
            });
        }

        case 'git_status': {
            return new Promise((resolve, reject) => {
                exec('git status --short', { cwd: WORKSPACE_DIR }, (err, stdout) => {
                    if (err) resolve(`Git error: ${err.message}`);
                    else resolve(stdout.trim() || 'Working tree clean (no changes)');
                });
            });
        }

        case 'git_diff': {
            return new Promise((resolve, reject) => {
                const target = args.file ? ` -- ${args.file}` : '';
                exec(`git diff${target}`, { cwd: WORKSPACE_DIR }, (err, stdout) => {
                    if (err) resolve(`Git diff error: ${err.message}`);
                    else resolve(stdout || '(No diff detected)');
                });
            });
        }

        case 'github_get_file': {
            const token = githubToken || process.env.GITHUB_TOKEN;
            const branch = args.branch || 'main';
            const url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}?ref=${branch}`;
            const res = await githubFetch(url, 'GET', null, token);
            if (res.content) {
                return Buffer.from(res.content, 'base64').toString('utf8');
            }
            return JSON.stringify(res, null, 2);
        }

        case 'github_create_or_update_file': {
            const token = githubToken || process.env.GITHUB_TOKEN;
            if (!token) throw new Error("GitHub token is required to create or update files on GitHub.");
            const branch = args.branch || 'main';
            const url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}`;
            
            // Check if file exists to get SHA
            let sha = null;
            try {
                const existing = await githubFetch(`${url}?ref=${branch}`, 'GET', null, token);
                if (existing && existing.sha) sha = existing.sha;
            } catch(e){}

            const payload = {
                message: args.message,
                content: Buffer.from(args.content).toString('base64'),
                branch: branch,
                ...(sha ? { sha } : {})
            };

            const result = await githubFetch(url, 'PUT', payload, token);
            return `Successfully committed ${args.path} to ${args.owner}/${args.repo}:${branch}`;
        }

        case 'github_list_issues': {
            const token = githubToken || process.env.GITHUB_TOKEN;
            const state = args.state || 'open';
            const url = `https://api.github.com/repos/${args.owner}/${args.repo}/issues?state=${state}`;
            const res = await githubFetch(url, 'GET', null, token);
            return JSON.stringify(res.map(i => ({ number: i.number, title: i.title, state: i.state, url: i.html_url })), null, 2);
        }

        case 'github_create_issue': {
            const token = githubToken || process.env.GITHUB_TOKEN;
            if (!token) throw new Error("GitHub token is required to create issues.");
            const url = `https://api.github.com/repos/${args.owner}/${args.repo}/issues`;
            const payload = { title: args.title, body: args.body };
            const res = await githubFetch(url, 'POST', payload, token);
            return `Issue created: #${res.number} (${res.html_url})`;
        }

        case 'github_create_pull_request': {
            const token = githubToken || process.env.GITHUB_TOKEN;
            if (!token) throw new Error("GitHub token is required to create pull requests.");
            const url = `https://api.github.com/repos/${args.owner}/${args.repo}/pulls`;
            const payload = {
                title: args.title,
                head: args.head,
                base: args.base || 'main',
                body: args.body || ''
            };
            const res = await githubFetch(url, 'POST', payload, token);
            return `Pull Request created: #${res.number} (${res.html_url})`;
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// GitHub HTTPS Helper
function githubFetch(urlStr, method = 'GET', body = null, token = '') {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const headers = {
            'User-Agent': 'UOR-R4-MCP-Bridge',
            'Accept': 'application/vnd.github.v3+json',
            ...(token ? { 'Authorization': `token ${token}` } : {})
        };
        if (body) headers['Content-Type'] = 'application/json';

        const req = https.request({
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.message || `GitHub error ${res.statusCode}`));
                    } else {
                        resolve(parsed);
                    }
                } catch(e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// --- PURE NODE.JS WEBSOCKET SERVER IMPLEMENTATION ---
function handleWebSocketUpgrade(req, socket) {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
        socket.destroy();
        return;
    }

    const acceptKey = crypto
        .createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
        .digest('base64');

    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`
    ];

    socket.write(headers.join('\r\n') + '\r\n\r\n');

    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        while (buffer.length >= 2) {
            const firstByte = buffer[0];
            const secondByte = buffer[1];
            const opcode = firstByte & 0x0f;
            const isMasked = (secondByte & 0x80) !== 0;
            let payloadLen = secondByte & 0x7f;
            let offset = 2;

            if (payloadLen === 126) {
                if (buffer.length < 4) break;
                payloadLen = buffer.readUInt16BE(2);
                offset = 4;
            } else if (payloadLen === 127) {
                if (buffer.length < 10) break;
                payloadLen = Number(buffer.readBigUInt64BE(2));
                offset = 10;
            }

            let maskKey = null;
            if (isMasked) {
                if (buffer.length < offset + 4) break;
                maskKey = buffer.slice(offset, offset + 4);
                offset += 4;
            }

            if (buffer.length < offset + payloadLen) break;

            const payload = buffer.slice(offset, offset + payloadLen);
            buffer = buffer.slice(offset + payloadLen);

            if (isMasked && maskKey) {
                for (let i = 0; i < payload.length; i++) {
                    payload[i] ^= maskKey[i % 4];
                }
            }

            // Text Frame (opcode 1) or Ping (opcode 9)
            if (opcode === 1) {
                const messageStr = payload.toString('utf8');
                processJsonRpcMessage(messageStr, (response) => {
                    sendWsText(socket, response);
                });
            } else if (opcode === 9) {
                // Pong (opcode 10)
                const pong = Buffer.from([0x8a, 0x00]);
                socket.write(pong);
            } else if (opcode === 8) {
                socket.end();
            }
        }
    });

    socket.on('error', (err) => console.warn('WS Client error:', err.message));
}

function sendWsText(socket, text) {
    if (!socket.writable) return;
    const payload = Buffer.from(text, 'utf8');
    let header;
    if (payload.length < 126) {
        header = Buffer.from([0x81, payload.length]);
    } else if (payload.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    socket.write(Buffer.concat([header, payload]));
}

// --- JSON-RPC 2.0 MCP MESSAGE HANDLER ---
async function processJsonRpcMessage(jsonStr, reply) {
    let req;
    try {
        req = JSON.parse(jsonStr);
    } catch(e) {
        return reply(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
    }

    const { id, method, params } = req;

    try {
        if (method === 'initialize') {
            return reply(JSON.stringify({
                jsonrpc: '2.0',
                id,
                result: {
                    protocolVersion: '2024-11-05',
                    serverInfo: { name: 'uor-mcp-bridge', version: '1.0.0' },
                    capabilities: { tools: {} }
                }
            }));
        }

        if (method === 'tools/list') {
            return reply(JSON.stringify({
                jsonrpc: '2.0',
                id,
                result: {
                    tools: MCP_TOOLS
                }
            }));
        }

        if (method === 'tools/call') {
            const toolName = params.name;
            const toolArgs = params.arguments || {};
            const githubToken = params.githubToken || '';

            console.log(`[MCP Tool Call] ⚡ ${toolName} with args:`, toolArgs);
            const output = await handleToolCall(toolName, toolArgs, githubToken);

            return reply(JSON.stringify({
                jsonrpc: '2.0',
                id,
                result: {
                    content: [
                        { type: 'text', text: String(output) }
                    ],
                    isError: false
                }
            }));
        }

        // Unknown method
        return reply(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` }
        }));

    } catch (err) {
        console.error(`[MCP Tool Error] in ${method}:`, err.message);
        return reply(JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
                content: [
                    { type: 'text', text: `Tool Error: ${err.message}` }
                ],
                isError: true
            }
        }));
    }
}

// --- HTTP SERVER & CORS ---
const server = http.createServer((req, res) => {
    // CORS headers allowing browser WebUI access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', toolsCount: MCP_TOOLS.length, workspace: WORKSPACE_DIR }));
        return;
    }

    if (req.method === 'POST' && req.url === '/mcp') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            processJsonRpcMessage(body, (response) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(response);
            });
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('UOR-R4 Local MCP Bridge Daemon is running. Connect via WebSocket ws://127.0.0.1:3000 or POST /mcp');
});

server.on('upgrade', handleWebSocketUpgrade);

server.listen(PORT, HOST, () => {
    console.log(`\n================================================================`);
    console.log(`  ⚡ UOR-R4 Geometric AI - Local MCP Bridge Daemon Active`);
    console.log(`  📍 Endpoint: ws://${HOST}:${PORT} (and http://${HOST}:${PORT}/mcp)`);
    console.log(`  📂 Local Workspace: ${WORKSPACE_DIR}`);
    console.log(`  🛠️  Active MCP Tools (${MCP_TOOLS.length}):`);
    MCP_TOOLS.forEach(t => console.log(`     • ${t.name}: ${t.description.slice(0, 56)}...`));
    console.log(`================================================================\n`);
});
