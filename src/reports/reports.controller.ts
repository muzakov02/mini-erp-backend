import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportRangeDto } from './dto/report-range.dto.js';
import { StockReportQueryDto } from './dto/stock-report-query.dto.js';
import { ReportsService } from './reports.service.js';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('stock')
  stock(@Query() query: StockReportQueryDto) {
    return this.reports.stockReport(query.warehouseId);
  }

  @Get('sales')
  sales(@Query() range: ReportRangeDto) {
    return this.reports.salesReport(range);
  }

  @Get('pnl')
  pnl(@Query() range: ReportRangeDto) {
    return this.reports.pnlReport(range);
  }
}
