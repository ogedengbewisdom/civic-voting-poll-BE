import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StateService implements OnModuleInit {
  constructor(
    @InjectRepository(State)
    private state_repo: Repository<State>,
  ) {}

  async onModuleInit() {
    await this.seed_states();
  }

  async seed_states() {
    const states = await this.state_repo.count();

    console.log('checking state...');

    if (states === 0) {
      console.log('no states found, seeding...');
      const state_seed = [
        { name: 'Abia' },
        { name: 'Adamawa' },
        { name: 'Akwa Ibom' },
        { name: 'Anambra' },
        { name: 'Bauchi' },
        { name: 'Bayelsa' },
        { name: 'Benue' },
        { name: 'Borno' },
        { name: 'Cross River' },
        { name: 'Delta' },
        { name: 'Ebonyi' },
        { name: 'Edo' },
        { name: 'Ekiti' },
        { name: 'Enugu' },
        { name: 'Gombe' },
        { name: 'Imo' },
        { name: 'Jigawa' },
        { name: 'Kaduna' },
        { name: 'Kano' },
        { name: 'Katsina' },
        { name: 'Kebbi' },
        { name: 'Kogi' },
        { name: 'Kwara' },
        { name: 'Lagos' },
        { name: 'Nasarawa' },
        { name: 'Niger' },
        { name: 'Ogun' },
        { name: 'Ondo' },
        { name: 'Osun' },
        { name: 'Oyo' },
        { name: 'Plateau' },
        { name: 'Rivers' },
        { name: 'Sokoto' },
        { name: 'Taraba' },
        { name: 'Yobe' },
        { name: 'Zamfara' },
        { name: 'FCT' },
      ];

      await this.state_repo.save(state_seed);
      console.log('states seeded successfully!');
    } else {
      console.log('states found, skipping...');
    }
  }

  async findAll() {
    return await this.state_repo.find();
  }

  async findOne(id: number) {
    return await this.state_repo.findOne({ where: { id } });
  }
}
