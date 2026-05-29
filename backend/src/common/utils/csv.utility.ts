import { Injectable, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';

/**
 * SERVICE UTILITAIRE CSV
 * Centralise toutes les opérations CSV (parse, génération, validation)
 */
@Injectable()
export class CsvUtility {
  /**
   * Parse CSV depuis un Buffer (utilise csv-parser pour robustesse)
   */
  async parseFromBuffer(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse CSV depuis une string (compatibilité ProductsService)
   */
  parseFromString(text: string): Array<Record<string, string>> {
    const lines = text.replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim().length);
    if (lines.length === 0) return [];
    
    const headers = this.splitCsvLine(lines[0]).map(h => h.trim());
    const rows: Array<Record<string, string>> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const cols = this.splitCsvLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = (cols[idx] ?? '').trim();
      });
      rows.push(row);
    }
    
    return rows;
  }

  /**
   * Split ligne CSV (supporte virgules dans quotes et quotes échappées)
   */
  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Quote échappée
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Convertir données en CSV
   */
  convertToCSV(data: any[], headers: string[]): string {
    const csvRows = [];
    
    // En-têtes
    csvRows.push(headers.join(','));
    
    // Données
    for (const row of data) {
      const values = headers.map(header => {
        const value = this.getNestedValue(row, header);
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  /**
   * Obtenir valeur imbriquée (ex: customer.email)
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  /**
   * Valider structure CSV
   */
  validateHeaders(data: any[], requiredHeaders: string[]): void {
    if (data.length === 0) {
      throw new BadRequestException('CSV vide');
    }

    const firstRow = data[0];
    const missingHeaders = requiredHeaders.filter(h => !(h in firstRow));
    
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Colonnes requises manquantes: ${missingHeaders.join(', ')}`
      );
    }
  }

  /**
   * Générer nom de fichier CSV avec date
   */
  generateFilename(prefix: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}_${date}.csv`;
  }
}
