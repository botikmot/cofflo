import { IsUUID } from 'class-validator';

export class AssignQueueTableDto {
  @IsUUID()
  tableId: string;
}
