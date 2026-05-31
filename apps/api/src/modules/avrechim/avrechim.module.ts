import { Module } from "@nestjs/common";
import { AvrechimController } from "./avrechim.controller";
import { AvrechimService } from "./avrechim.service";

@Module({
  controllers: [AvrechimController],
  providers: [AvrechimService]
})
export class AvrechimModule {}
