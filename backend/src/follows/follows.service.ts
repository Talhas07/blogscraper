import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateFollowDto } from "./dto/create-follow.dto";
import { UpdateFollowDto } from "./dto/update-follow.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Follow } from "./entities/follow.entity";
import { User } from "src/users/entities/user.entity";

// follows.service.ts
@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followRepo: Repository<Follow>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async create(dto: CreateFollowDto) {
    const followedBy = await this.userRepo.findOneBy({ id: dto.followedById });
    const followTo = await this.userRepo.findOneBy({ id: dto.followToId });
    // console.log("followedById", dto.followedById);
    // console.log("followToId", dto.followToId);
    // console.log("followedBy", followedBy);
    // console.log("followTo", followTo);
    const follow = this.followRepo.create({ followedBy, followTo });
    return this.followRepo.save(follow);
  }

  findAll() {
    return this.followRepo.find({ relations: ["followedBy", "followTo"] });
  }

  findOne(id: string) {
    return this.followRepo.findOne({
      where: { id },
      relations: ["followedBy", "followTo"],
    });
  }

  async update(id: string, updateFollowDto: UpdateFollowDto): Promise<Follow> {
    const follow = await this.followRepo.findOne({ where: { id } });

    if (!follow) {
      throw new NotFoundException(`Follow with ID ${id} not found`);
    }

    Object.assign(follow, updateFollowDto);
    return this.followRepo.save(follow);
  }
  async remove(id: string) {
    return this.followRepo.delete(id);
  }
}
