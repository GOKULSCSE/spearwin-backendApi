import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { promisify } from 'util';
import * as path from 'path';

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

@Injectable()
export class PdfExtractorService {
  private readonly logger = new Logger(PdfExtractorService.name);

  /**
   * Extract text from a PDF file
   * @param filePath - Path to the PDF file (local or URL)
   * @returns Extracted text content
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      this.logger.log(`Extracting text from PDF: ${filePath}`);

      let dataBuffer: Buffer;

      // Check if filePath is a URL
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        this.logger.log('Downloading PDF from URL...');
        dataBuffer = await this.downloadFile(filePath);
      } else {
        // Local file path
        const fileExists = await exists(filePath);
        if (!fileExists) {
          throw new Error(`File not found: ${filePath}`);
        }
        dataBuffer = await readFile(filePath);
      }

      // Extract text using pdf-parse
      const data = await pdfParse(dataBuffer);
      const extractedText = data.text.trim();

      this.logger.log(
        `Successfully extracted ${extractedText.length} characters from PDF`,
      );

      return extractedText;
    } catch (error) {
      this.logger.error(`Failed to extract text from PDF: ${error.message}`);
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  /**
   * Download file from URL
   * @param url - File URL
   * @returns Buffer containing file data
   */
  private downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;

      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download file. Status: ${response.statusCode}`),
          );
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });
    });
  }

  /**
   * Clean and normalize extracted text for better search results
   * @param text - Raw extracted text
   * @returns Cleaned text
   */
  cleanExtractedText(text: string): string {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove special characters that might interfere with search
        .replace(/[^\w\s.,@-]/g, ' ')
        // Trim
        .trim()
    );
  }

  /**
   * Extract keywords from text for quick search indexing
   * @param text - Extracted text
   * @returns Array of keywords
   */
  extractKeywords(text: string): string[] {
    // Simple keyword extraction - remove common words and get unique terms
    const commonWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'can',
    ]);

    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(
        (word) => word.length > 2 && !commonWords.has(word) && /^[a-z]+$/.test(word),
      );

    return Array.from(new Set(words));
  }

  /**
   * Find text snippets that match a search query
   * @param text - Full text to search in
   * @param query - Search query
   * @param snippetLength - Length of snippet to extract (characters around match)
   * @returns Array of matching snippets
   */
  findMatchingSnippets(
    text: string,
    query: string,
    snippetLength: number = 150,
  ): string[] {
    const snippets: string[] = [];
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Split query into keywords
    const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);

    keywords.forEach((keyword) => {
      let startIndex = 0;
      while (startIndex < textLower.length) {
        const index = textLower.indexOf(keyword, startIndex);
        if (index === -1) break;

        // Extract snippet around the match
        const snippetStart = Math.max(0, index - snippetLength / 2);
        const snippetEnd = Math.min(
          text.length,
          index + keyword.length + snippetLength / 2,
        );
        let snippet = text.substring(snippetStart, snippetEnd);

        // Add ellipsis if not at start/end
        if (snippetStart > 0) snippet = '...' + snippet;
        if (snippetEnd < text.length) snippet = snippet + '...';

        snippets.push(snippet);

        startIndex = index + keyword.length;

        // Limit to 3 snippets per keyword
        if (
          snippets.filter((s) => s.toLowerCase().includes(keyword)).length >= 3
        ) {
          break;
        }
      }
    });

    return snippets.slice(0, 5); // Return max 5 snippets
  }
}

