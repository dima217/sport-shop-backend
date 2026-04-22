import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/** Language code used when content was written — change here if needed. */
export const DEFAULT_CONTENT_LANG = 'ru';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /** Shared cache across all modules: "from:to:<text>" → translated string */
  private readonly cache = new Map<string, string>();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Translates a single string.
   * Returns the original string if translation is not needed or fails.
   */
  async translateText(text: string, from: string, to: string): Promise<string> {
    if (!text?.trim()) return text;

    const normalFrom = from.toLowerCase();
    const normalTo = to.toLowerCase();

    if (normalFrom === normalTo) return text;

    const key = `${normalFrom}:${normalTo}:${text}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const translated = await this.callGoogle(text, normalFrom, normalTo);
    this.cache.set(key, translated);
    return translated;
  }

  /**
   * Translates multiple strings in parallel (cache-aware).
   * Order of results matches the input order.
   */
  async translateMany(texts: string[], from: string, to: string): Promise<string[]> {
    return Promise.all(texts.map((t) => this.translateText(t, from, to)));
  }

  /** Manually remove all cached entries (useful in tests or when source language changes). */
  clearCache(): void {
    this.cache.clear();
  }

  private async callGoogle(text: string, from: string, to: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<unknown>('https://translate.googleapis.com/translate_a/single', {
          params: { client: 'gtx', sl: from, tl: to, dt: 't', q: text },
        }),
      );

      // Response shape: [ [ ["translated", "original"], … ], … ]
      const data = response.data as unknown[][][];
      const segments: string[] = (data[0] ?? [])
        .filter((s) => Array.isArray(s) && typeof s[0] === 'string')
        .map((s) => s[0] as string);

      return segments.join('') || text;
    } catch (err) {
      this.logger.warn(`Translation failed (${from} → ${to}): ${(err as Error).message}`);
      return text;
    }
  }
}
