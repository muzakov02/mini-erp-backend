import { Module } from '@nestjs/common';
import { DocumentReferencesService } from './document-references.service.js';

@Module({
  providers: [DocumentReferencesService],
  exports: [DocumentReferencesService],
})
export class DocumentsModule {}
