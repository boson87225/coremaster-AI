
import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const processLine = (line: string): { __html: string } => {
    // Bold and Italic
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    line = line.replace(/`(.*?)`/g, '<code class="bg-gray-200 text-gray-800 rounded px-1 py-0.5 font-mono text-sm">$1</code>');
    return { __html: line };
  };

  const elements = text.split('\n').map((line, index) => {
    if (line.trim().startsWith('### ')) {
      return <h3 key={index} className="text-lg font-bold mt-4 mb-2" dangerouslySetInnerHTML={processLine(line.replace('### ', ''))} />;
    }
    if (line.trim().startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={processLine(line.replace('## ', ''))} />;
    }
    if (line.trim().startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold mt-8 mb-4" dangerouslySetInnerHTML={processLine(line.replace('# ', ''))} />;
    }
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return <li key={index} className="ml-4" dangerouslySetInnerHTML={processLine(line.substring(2))} />;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      return <li key={index} className="ml-4" dangerouslySetInnerHTML={processLine(line.replace(/^\d+\.\s/, ''))} />;
    }
    if (line.trim() === '') {
        return <br key={index} />;
    }
    return <p key={index} dangerouslySetInnerHTML={processLine(line)} />;
  });

  const groupedElements: React.ReactNode[] = [];
  let listItems: React.ReactElement[] = [];
  let listType: 'ul' | 'ol' | null = null;

  elements.forEach((el, index) => {
    if (React.isValidElement(el) && el.type === 'li') {
        const isOrdered = /^\d+\.\s/.test(text.split('\n')[index].trim());
        const currentListType = isOrdered ? 'ol' : 'ul';

        if(listType !== currentListType && listItems.length > 0) {
             groupedElements.push(
                listType === 'ol' 
                ? <ol key={`list-${index}`} className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>
                : <ul key={`list-${index}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>
             );
             listItems = [];
        }
        
        listType = currentListType;
        listItems.push(el);
    } else {
      if (listItems.length > 0) {
        groupedElements.push(
            listType === 'ol' 
            ? <ol key={`list-${index}`} className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>
            : <ul key={`list-${index}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>
        );
        listItems = [];
        listType = null;
      }
      groupedElements.push(el);
    }
  });

  if (listItems.length > 0) {
     groupedElements.push(
        listType === 'ol' 
        ? <ol key="list-end" className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>
        : <ul key="list-end" className="list-disc list-inside space-y-1 my-2">{listItems}</ul>
    );
  }

  return <div className="prose prose-sm max-w-none">{groupedElements}</div>;
};