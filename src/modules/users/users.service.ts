import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'
import Logging from 'library/Logging'
import { AbstractService } from 'modules/common/abstract.service'
import { Repository } from 'typeorm'
import { compareHash, hash } from 'utils/bycrpt'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService extends AbstractService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException('User already exists with this email')
    }
    try {
      const newUser = this.usersRepository.create({
        ...createUserDto,
        role: createUserDto.role_id ? { id: createUserDto.role_id } : undefined,
      })
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a user')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, role_id, ...data } = updateUserDto

    if (user.email !== email && email) {
      user.email = email
    }

    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Password and confirm password do not match')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('New password cannot be the same as the old password')
      }
      user.password = await hash(password)
    }

    if (role_id) {
      user.role = { ...user.role, id: role_id }
    }

    try {
      Object.entries(data).map(([key, value]) => {
        user[key] = value
      })

      return await this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User already exists with this email')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user')
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }
}
