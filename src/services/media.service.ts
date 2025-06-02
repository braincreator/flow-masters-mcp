import type { Payload } from 'payload';
import { BaseService } from './base.service';

export class MediaService extends BaseService {
  constructor(payload: Payload) {
    super(payload);
  }

  async deleteMediaItems(params: {
    ids: string[];
    locale?: 'en' | 'ru';
  }): Promise<void> {
    const { ids, locale } = params;

    await this.payload.delete({
      collection: 'media',
      where: {
        id: {
          in: ids
        }
      },
      locale
    });
  }
}