import { getLogger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { SupportedTextSplitterLanguage } from 'langchain/text_splitter';
import { CodeChunk, ChunkingStrategy, ChunkStrategyType } from '../types';

const logger = getLogger('ChunkingManager');

/**
 * Manages code chunking with various strategies tailored to different code types
 */
export class ChunkingManager {
  private strategy: ChunkingStrategy;
  private languageMap: Record<string, SupportedTextSplitterLanguage | undefined>;

  /**
   * Creates a new ChunkingManager with the specified strategy
   * @param strategy Chunking strategy configuration
   */
  constructor(strategy: ChunkingStrategy) {
    this.strategy = strategy;
    
    // Map file extensions to LangChain supported languages
    this.languageMap = {
      ts: 'js', // Use 'js' for TypeScript (LangChain's closest match)
      js: 'js',
      jsx: 'js',
      tsx: 'js',
      py: 'python',
      java: 'java',
      cs: 'java', // Map C# to Java as approximation
      cpp: 'cpp',
      c: 'cpp',
      go: 'go',
      rb: 'ruby',
      php: 'php',
      rs: 'rust',
      swift: 'swift',
      kt: 'scala', // Map Kotlin to Scala as approximation
      scala: 'scala',
      md: 'markdown',
      html: 'html',
      css: 'html', // Map CSS to HTML as approximation
      json: 'markdown', // Map JSON to markdown as approximation
      yaml: 'markdown', // Map YAML to markdown as approximation
      yml: 'markdown',
      sql: 'markdown', // Map SQL to markdown as approximation
      sh: 'markdown', // Map shell scripts to markdown as approximation
      bash: 'markdown',
    };
  }
  /**
   * Chunks a file's content based on the specified strategy
   * @param content The file content to chunk
   * @param strategy The chunking strategy to apply
   * @param fileInfo Information about the file
   * @returns An array of code chunks
   */
  async chunkFile(content: string, strategy: string, fileInfo: any): Promise<CodeChunk[]> {
    logger.info(`Chunking file with strategy: ${strategy} - ${fileInfo.file_path}`);
    
    if (!content || content.trim() === '') {
      logger.warn(`Empty content for file: ${fileInfo.file_path}`);  
      return [];
    }

    // Determine language for better chunking
    const extension = path.extname(fileInfo.file_path).substring(1).toLowerCase();
    const language = this.languageMap[extension] || 'text';
    
    try {
      // Apply the appropriate chunking strategy
      switch (strategy as ChunkStrategyType) {
        case 'function_level':
          return await this.chunkByFunction(content, fileInfo, language);
          
        case 'class_level':
          return await this.chunkByClass(content, fileInfo, language);
          
        case 'file_level':
          return await this.chunkAsFile(content, fileInfo, language);
          
        case 'sliding_window':
          return await this.chunkBySlidingWindow(content, fileInfo, language, 0.1); // 10% overlap
          
        case 'sliding_window_with_overlap':
          return await this.chunkBySlidingWindow(content, fileInfo, language, 0.25); // 25% overlap
          
        case 'sliding_window_with_high_overlap':
          return await this.chunkBySlidingWindow(content, fileInfo, language, 0.5); // 50% overlap
          
        default:
          logger.warn(`Unknown chunking strategy: ${strategy}, falling back to sliding window`);
          return await this.chunkBySlidingWindow(content, fileInfo, language, 0.1);
      }
    } catch (error) {
      logger.error(`Error chunking file ${fileInfo.file_path}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Fallback to a simple chunking approach if the advanced methods fail
      return this.fallbackChunking(content, fileInfo);
    }
  }
  
  /**
   * Chunks code by function boundaries
   */
  private async chunkByFunction(content: string, fileInfo: any, language: string): Promise<CodeChunk[]> {
    const chunks: CodeChunk[] = [];
    
    // Use regex patterns to identify function boundaries based on language
    const functionPatterns: Record<string, RegExp> = {
      typescript: /(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{([\s\S]*?)\}/g,
      javascript: /(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g,
      python: /def\s+([\w_]+)\s*\([^)]*\)\s*(?:->\s*[^:]+)?\s*:([\s\S]*?)(?=\n\s*def|\n\s*class|$)/g,
      java: /(?:public|private|protected|static|final|abstract|synchronized|native)*\s+(?:[\w<>\[\]]+)\s+([\w$]+)\s*\([^)]*\)\s*(?:throws\s+[\w\s,]+)?\s*\{([\s\S]*?)\}/g,
      'default': /function\s+([\w$]+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g
    };
    
    const pattern = functionPatterns[language as keyof typeof functionPatterns] || functionPatterns['default'];
    
    // Extract methods/functions using regex
    let match;
    let lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      const functionName = match[1];
      const functionBody = match[0]; // Full function including signature
      const startIndex = match.index;
      const endIndex = pattern.lastIndex;
      
      // Calculate line numbers
      const contentBeforeFunction = content.substring(0, startIndex);
      const startLine = contentBeforeFunction.split('\n').length;
      const endLine = startLine + functionBody.split('\n').length - 1;
      
      chunks.push({
        content: functionBody,
        metadata: {
          ...fileInfo,
          file_path: fileInfo.file_path,
          strategy: 'function_level',
          language,
          start_line: startLine,
          end_line: endLine,
          function_name: functionName,
          chunk_type: 'function'
        }
      });
      
      lastIndex = endIndex;
    }
    
    // If no functions were found or there's significant code outside functions,
    // add the remaining content as a separate chunk
    if (chunks.length === 0 || content.length - lastIndex > 200) {
      const remainingContent = content.substring(lastIndex);
      if (remainingContent.trim().length > 0) {
        const startLine = content.substring(0, lastIndex).split('\n').length;
        const endLine = content.split('\n').length;
        
        chunks.push({
          content: remainingContent,
          metadata: {
            ...fileInfo,
            file_path: fileInfo.file_path,
            strategy: 'function_level',
            language,
            start_line: startLine,
            end_line: endLine,
            chunk_type: 'code_segment'
          }
        });
      }
    }
    
    return chunks;
  }

  /**
   * Chunks code by class boundaries
   */
  private async chunkByClass(content: string, fileInfo: any, language: string): Promise<CodeChunk[]> {
    const chunks: CodeChunk[] = [];
    
    // Class patterns for different languages
    const classPatterns: Record<string, RegExp> = {
      typescript: /(?:export\s+)?(?:abstract\s+)?class\s+([\w$]+)(?:\s+extends\s+[\w$.]+)?(?:\s+implements\s+[\w$.]+(?:\s*,\s*[\w$.]+)*)?\s*\{([\s\S]*?)\}/g,
      javascript: /(?:export\s+)?class\s+([\w$]+)(?:\s+extends\s+[\w$.]+)?\s*\{([\s\S]*?)\}/g,
      python: /class\s+([\w_]+)\s*(?:\([^)]*\))?\s*:([\s\S]*?)(?=\n\s*(?:class|def|$))/g,
      java: /(?:public|private|protected|abstract|final)*\s+class\s+([\w$]+)(?:\s+extends\s+[\w$.]+)?(?:\s+implements\s+[\w$.]+(?:\s*,\s*[\w$.]+)*)?\s*\{([\s\S]*?)\}/g,
      'default': /class\s+([\w$]+)(?:\s+extends\s+[\w$.]+)?\s*\{([\s\S]*?)\}/g
    };
    
    const pattern = classPatterns[language as keyof typeof classPatterns] || classPatterns['default'];
    
    // Extract classes using regex
    let match;
    let lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      const className = match[1];
      const classBody = match[0]; // Full class including declaration
      const startIndex = match.index;
      const endIndex = pattern.lastIndex;
      
      // Calculate line numbers
      const contentBeforeClass = content.substring(0, startIndex);
      const startLine = contentBeforeClass.split('\n').length;
      const endLine = startLine + classBody.split('\n').length - 1;
      
      chunks.push({
        content: classBody,
        metadata: {
          ...fileInfo,
          file_path: fileInfo.file_path,
          strategy: 'class_level',
          language,
          start_line: startLine,
          end_line: endLine,
          class_name: className,
          chunk_type: 'class'
        }
      });
      
      lastIndex = endIndex;
    }
    
    // If no classes were found or there's significant code outside classes,
    // add the remaining content as a separate chunk
    if (chunks.length === 0 || content.length - lastIndex > 200) {
      const remainingContent = content.substring(lastIndex);
      if (remainingContent.trim().length > 0) {
        const startLine = content.substring(0, lastIndex).split('\n').length;
        const endLine = content.split('\n').length;
        
        chunks.push({
          content: remainingContent,
          metadata: {
            ...fileInfo,
            file_path: fileInfo.file_path,
            strategy: 'class_level',
            language,
            start_line: startLine,
            end_line: endLine,
            chunk_type: 'code_segment'
          }
        });
      }
    }
    
    return chunks;
  }
  
  /**
   * Treats the entire file as one chunk
   */
  private async chunkAsFile(content: string, fileInfo: any, language: string): Promise<CodeChunk[]> {
    return [{
      content,
      metadata: {
        ...fileInfo,
        file_path: fileInfo.file_path,
        strategy: 'file_level',
        language,
        start_line: 1,
        end_line: content.split('\n').length,
        chunk_type: 'file'
      }
    }];
  }
  
  /**
   * Chunks content using a sliding window approach with configurable overlap
   */
  private async chunkBySlidingWindow(content: string, fileInfo: any, language: string, overlap: number): Promise<CodeChunk[]> {
    const chunkSize = this.determineChunkSize(content, language);
    
    // Use LangChain's text splitters for code-aware chunking
    let splitter;
    const langchainLanguage = language as SupportedTextSplitterLanguage;
    
    // Make sure the language is actually supported
    if (Object.values(this.languageMap).includes(langchainLanguage) && 
        ['cpp', 'go', 'java', 'js', 'php', 'proto', 'python', 'rst', 'ruby', 'rust', 
         'scala', 'swift', 'markdown', 'latex', 'html', 'sol'].includes(langchainLanguage)) {
      // Use the language-specific recursive character text splitter
      splitter = RecursiveCharacterTextSplitter.fromLanguage(
        langchainLanguage, {
          chunkSize,
          chunkOverlap: Math.floor(chunkSize * overlap)
        }
      );
    } else {
      // Fall back to token-based splitting for unsupported languages
      splitter = new TokenTextSplitter({
        chunkSize: Math.floor(chunkSize / 4), // Tokens are roughly 4 chars
        chunkOverlap: Math.floor((chunkSize / 4) * overlap)
      });
    }
    
    // Create document from content
    const doc = new Document({
      pageContent: content,
      metadata: {
        ...fileInfo,
        file_path: fileInfo.file_path,
        language,
      }
    });
    
    // Split the document
    const docs = await splitter.splitDocuments([doc]);
    
    // Convert LangChain documents to our CodeChunk format
    return docs.map((doc, index) => {
      // Calculate approximate line numbers
      const docStartIndex = content.indexOf(doc.pageContent);
      const contentBeforeChunk = content.substring(0, docStartIndex);
      const startLine = contentBeforeChunk.split('\n').length;
      const endLine = startLine + doc.pageContent.split('\n').length - 1;
      
      return {
        content: doc.pageContent,
        metadata: {
          ...fileInfo,
          ...doc.metadata,
          file_path: fileInfo.file_path,
          strategy: `sliding_window_${overlap === 0.1 ? '' : overlap === 0.25 ? 'with_overlap' : 'with_high_overlap'}`,
          language,
          start_line: startLine,
          end_line: endLine,
          chunk_index: index,
          chunk_type: 'sliding_window'
        }
      };
    });
  }
  
  /**
   * Simple fallback chunking strategy when advanced methods fail
   */
  private fallbackChunking(content: string, fileInfo: any): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const lines = content.split('\n');
    const chunkSize = 50; // Lines per chunk
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);
      const chunkContent = chunkLines.join('\n');
      
      if (chunkContent.trim().length > 0) {
        chunks.push({
          content: chunkContent,
          metadata: {
            ...fileInfo,
            file_path: fileInfo.file_path,
            strategy: 'fallback',
            start_line: i + 1,
            end_line: Math.min(i + chunkSize, lines.length),
            chunk_type: 'fallback'
          }
        });
      }
    }
    
    return chunks;
  }
  
  /**
   * Determines appropriate chunk size based on content and language
   */
  private determineChunkSize(content: string, language: string): number {
    const totalLength = content.length;
    
    // Base chunk size on content length, with limits
    if (totalLength < 5000) {
      return 1000; // Small files get smaller chunks
    } else if (totalLength < 20000) {
      return 1500; // Medium files
    } else {
      return 2000; // Large files
    }
  }
}
