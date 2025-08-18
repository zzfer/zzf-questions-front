<template>
  <div class="category-management">
    <div class="header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>
    </div>

    <!-- 分类列表 -->
    <el-table :data="categories" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="分类名称" width="150"></el-table-column>
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="scope">
          <Icon :icon="getIconComponent(scope.row.icon)" width="18" height="18" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="editCategory(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCategory(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <IconPicker v-model="categoryForm.icon" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import IconPicker from '@/components/IconPicker.vue'

export default {
  name: 'CategoryManagement',
  components: {
    Icon,
    IconPicker
  },
  data() {
    return {
      categories: [],
      loading: false,
      dialogVisible: false,
      isEdit: false,
      categoryForm: {
        id: null,
        name: '',
        icon: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请选择图标', trigger: 'change' }
        ]
      },

    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑分类' : '添加分类'
    }
  },
  mounted() {
    this.loadCategories()
  },
  methods: {
    async loadCategories() {
      this.loading = true
      try {
        const response = await api.get('/api/categories')
        this.categories = response.data
      } catch (error) {
        console.error('加载分类失败:', error)
        ElMessage.error('加载分类失败')
      } finally {
        this.loading = false
      }
    },
    showAddDialog() {
      this.isEdit = false
      this.dialogVisible = true
    },
    editCategory(category) {
      this.isEdit = true
      this.categoryForm = {
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description
      }
      this.dialogVisible = true
    },
    async saveCategory() {
      try {
        await this.$refs.categoryFormRef.validate()
        
        if (this.isEdit) {
          await api.put(`/api/categories/${this.categoryForm.id}`, this.categoryForm)
          ElMessage.success('分类更新成功')
        } else {
          await api.post('/api/categories', this.categoryForm)
          ElMessage.success('分类添加成功')
        }
        
        this.dialogVisible = false
        this.loadCategories()
      } catch (error) {
        console.error('保存分类失败:', error)
        ElMessage.error('保存分类失败')
      }
    },
    async deleteCategory(category) {
      try {
        await ElMessageBox.confirm(
          `确定要删除分类 "${category.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await api.delete(`/api/categories/${category.id}`)
        ElMessage.success('分类删除成功')
        this.loadCategories()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除分类失败:', error)
          ElMessage.error('删除分类失败')
        }
      }
    },
    resetForm() {
      this.categoryForm = {
        id: null,
        name: '',
        icon: '',
        description: ''
      }
      if (this.$refs.categoryFormRef) {
        this.$refs.categoryFormRef.resetFields()
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    getIconComponent(iconName) {
      // 处理旧的Element Plus图标名称映射
      const iconMap = {
        'Bicycle': 'flat-color-icons:automotive',
        'ShoppingBag': 'flat-color-icons:shop',
        'VideoPlay': 'flat-color-icons:music',
        'FirstAidKit': 'flat-color-icons:biohazard',
        'Reading': 'flat-color-icons:reading',
        'House': 'flat-color-icons:home',
        'Iphone': 'flat-color-icons:phone',
        'Gift': 'flat-color-icons:briefcase',
        'More': 'flat-color-icons:settings'
      };

      // 如果是旧的图标名称，转换为新的
      if (iconMap[iconName]) {
        return iconMap[iconName];
      }

      // 如果已经是Iconify格式，直接返回
      if (iconName && iconName.includes(':')) {
        return iconName;
      }

      // 默认返回原始名称
      return iconName;
    }
  }
}
</script>

<style scoped>
.category-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.dialog-footer {
  text-align: right;
}

.el-table {
  margin-top: 20px;
}
</style>