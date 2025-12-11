/**
 * Markdown Renderer Component
 * Renders markdown-formatted text with proper styling
 */

export default function MarkdownRenderer({ content, className = '' }) {
    if (!content) return null;

    const renderMarkdown = (text) => {

        const lines = text.split('\n');
        const elements = [];
        let listItems = [];
        let listType = null;
        let inCodeBlock = false;
        let codeBlockContent = [];

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ul') {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 ml-2">
                            {listItems.map((item, i) => (
                                <li key={i} className="text-gray-700">{renderInline(item)}</li>
                            ))}
                        </ul>
                    );
                } else if (listType === 'ol') {
                    elements.push(
                        <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 ml-2">
                            {listItems.map((item, i) => (
                                <li key={i} className="text-gray-700">{renderInline(item)}</li>
                            ))}
                        </ol>
                    );
                }
                listItems = [];
                listType = null;
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {

                    flushList();
                    elements.push(
                        <pre key={`code-${elements.length}`} className="bg-gray-100 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono text-gray-800">
                            {codeBlockContent.join('\n')}
                        </pre>
                    );
                    codeBlockContent = [];
                    inCodeBlock = false;
                } else {

                    flushList();
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                continue;
            }

            if (line.startsWith('### ')) {
                flushList();
                elements.push(
                    <h3 key={`h3-${elements.length}`} className="text-lg font-bold text-gray-900 mt-4 mb-2">
                        {renderInline(line.slice(4))}
                    </h3>
                );
                continue;
            }
            if (line.startsWith('## ')) {
                flushList();
                elements.push(
                    <h2 key={`h2-${elements.length}`} className="text-xl font-bold text-gray-900 mt-5 mb-3">
                        {renderInline(line.slice(3))}
                    </h2>
                );
                continue;
            }
            if (line.startsWith('# ')) {
                flushList();
                elements.push(
                    <h1 key={`h1-${elements.length}`} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
                        {renderInline(line.slice(2))}
                    </h1>
                );
                continue;
            }

            const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
            if (numberedMatch) {
                if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                }
                listItems.push(numberedMatch[2]);
                continue;
            }

            const bulletMatch = line.match(/^[-*•]\s+(.+)/);
            if (bulletMatch) {
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                }
                listItems.push(bulletMatch[1]);
                continue;
            }

            if (line.match(/^[-*_]{3,}$/)) {
                flushList();
                elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-gray-200" />);
                continue;
            }

            if (line.trim() === '') {
                flushList();
                continue;
            }

            flushList();
            elements.push(
                <p key={`p-${elements.length}`} className="text-gray-700 my-2 leading-relaxed">
                    {renderInline(line)}
                </p>
            );
        }

        flushList();

        return elements;
    };

    const renderInline = (text) => {
        if (!text) return null;

        const parts = [];
        let remaining = text;
        let key = 0;

        while (remaining.length > 0) {

            let match = remaining.match(/^(.*?)\*\*(.+?)\*\*/);
            if (!match) match = remaining.match(/^(.*?)__(.+?)__/);
            if (match) {
                if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
                parts.push(<strong key={key++} className="font-bold text-gray-900">{match[2]}</strong>);
                remaining = remaining.slice(match[0].length);
                continue;
            }

            match = remaining.match(/^(.*?)\*(.+?)\*/);
            if (!match) match = remaining.match(/^(.*?)_(.+?)_/);
            if (match && !match[1].endsWith('*')) {
                if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
                parts.push(<em key={key++} className="italic">{match[2]}</em>);
                remaining = remaining.slice(match[0].length);
                continue;
            }

            match = remaining.match(/^(.*?)`(.+?)`/);
            if (match) {
                if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
                parts.push(
                    <code key={key++} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#FA812F]">
                        {match[2]}
                    </code>
                );
                remaining = remaining.slice(match[0].length);
                continue;
            }

            parts.push(<span key={key++}>{remaining}</span>);
            break;
        }

        return parts.length === 1 ? parts[0] : parts;
    };

    return (
        <div className={`markdown-content ${className}`}>
            {renderMarkdown(content)}
        </div>
    );
}
