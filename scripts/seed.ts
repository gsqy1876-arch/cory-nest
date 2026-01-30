/**
 * 数据库种子数据脚本
 * 
 * 用于初始化数据库的基础数据
 */

import { runScript } from './db-utils'
import { User } from '../src/modules/user/entities/user.entity'
import * as bcrypt from 'bcryptjs'

runScript('Seed Database', async (dataSource) => {
  const userRepository = dataSource.getRepository(User)

  // 检查是否已有管理员
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@admin.com' },
  })

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists, skipping...')
    return
  }

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminData = {
    email: 'admin@admin.com',
    password: hashedPassword,
    name: 'Administrator',
    role: 'admin',
    isActive: true,
    permissions: [
      'dashboard:view',
      'dashboard:create',
      'dashboard:edit',
      'dashboard:delete',
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
      'inventory:view',
      'inventory:create',
      'inventory:edit',
      'inventory:delete',
      'orders:view',
      'orders:create',
      'orders:edit',
      'orders:delete',
    ],
    menus: ['dashboard', 'users', 'orders', 'inventory'],
  }

  const admin = userRepository.create(adminData)
  await userRepository.save(admin)
  console.log('✅ Admin user created successfully')
  console.log('   Email: admin@admin.com')
  console.log('   Password: admin123')

  // 创建测试用户
  const testUserPassword = await bcrypt.hash('user123', 10)
  
  const userData = {
    email: 'user@test.com',
    password: testUserPassword,
    name: 'Test User',
    role: 'user',
    isActive: true,
    permissions: ['dashboard:view', 'inventory:view'],
    menus: ['dashboard', 'inventory'],
  }

  const testUser = userRepository.create(userData)
  await userRepository.save(testUser)
  console.log('✅ Test user created successfully')
  console.log('   Email: user@test.com')
  console.log('   Password: user123')
})
