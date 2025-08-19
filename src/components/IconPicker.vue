<template>
  <div class="icon-picker">
    <el-input
      :value="selectedIconLabel"
      placeholder="请选择图标"
      readonly
      @click="showDialog = true"
    >
      <template #prefix>
        <Icon v-if="selectedIcon" :icon="selectedIcon" width="16" height="16" />
      </template>
    </el-input>

    <el-dialog
      v-model="showDialog"
      title="选择图标"
      width="700px"
      :before-close="handleClose"
    >
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图标..."
          clearable
          @input="filterIcons"
        >
          <template #prefix>
            <Icon icon="flat-color-icons:search" width="16" height="16" />
          </template>
        </el-input>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <el-tag
          v-for="category in categories"
          :key="category.key"
          :type="selectedCategory === category.key ? 'primary' : 'info'"
          class="category-tag"
          @click="selectCategory(category.key)"
        >
          {{ category.label }}
        </el-tag>
      </div>

      <!-- 图标网格 -->
      <div class="icon-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon.value"
          class="icon-item"
          :class="{ active: selectedIcon === icon.value }"
          @click="selectIcon(icon.value)"
        >
          <Icon 
            :icon="icon.value" 
            width="24" 
            height="24" 
            @error="handleIconError(icon)"
            :style="{ minHeight: '24px' }"
          />
          <span class="icon-label">{{ icon.label }}</span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'IconPicker',
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showDialog: false,
      searchKeyword: '',
      selectedCategory: 'all',
      selectedIcon: this.modelValue,
      categories: [
        { key: 'all', label: '全部' },
        { key: 'food', label: '餐饮' },
        { key: 'transport', label: '交通' },
        { key: 'shopping', label: '购物' },
        { key: 'entertainment', label: '娱乐' },
        { key: 'health', label: '医疗' },
        { key: 'education', label: '教育' },
        { key: 'home', label: '住房' },
        { key: 'communication', label: '通讯' },
        { key: 'work', label: '工作' },
        { key: 'other', label: '其他' }
      ],
      allIcons: [
        // 餐饮类
        { value: 'fluent-emoji-flat:bellhop-bell', label: '餐厅', category: 'food' },
        
        // 交通类
        { value: 'fluent-emoji-flat:bus', label: '公交', category: 'transport' },
        { value: 'emojione-v1:train', label: '火车', category: 'transport' },
        { value: 'twemoji:airplane', label: '飞机', category: 'transport' },
        { value: 'openmoji:autonomous-car', label: '滴滴', category: 'transport' },
        
        // 购物类
        { value: 'icon-park:shopping-cart', label: '购物', category: 'shopping' },
        { value: 'streamline-emojis:wrapped-gift-2', label: '礼物', category: 'shopping' },
        
        // 娱乐类
        { value: 'icon-park:game-handle', label: '游戏', category: 'entertainment' },
        { value: 'fluent-color:headphones-20', label: '耳机', category: 'entertainment' },
        
        // { value: 'flat-color-icons:cafe', label: '咖啡', category: 'food' },
        // { value: 'flat-color-icons:pizza', label: '披萨', category: 'food' },
        // { value: 'flat-color-icons:beer', label: '啤酒', category: 'food' },
        // { value: 'flat-color-icons:wine', label: '红酒', category: 'food' },
        // { value: 'flat-color-icons:cake', label: '蛋糕', category: 'food' },
        // 医疗类
        // { value: 'flat-color-icons:biohazard', label: '医疗', category: 'health' },
        { value: 'fxemoji:hospital', label: '医院', category: 'health' },
        { value: 'openmoji:pill', label: '药物', category: 'health' },
        // { value: 'flat-color-icons:syringe', label: '注射器', category: 'health' },
        // { value: 'flat-color-icons:stethoscope', label: '听诊器', category: 'health' },
        // { value: 'flat-color-icons:first-aid', label: '急救', category: 'health' },        
        // 教育类
        { value: 'flat-color-icons:reading', label: '阅读', category: 'education' },
        // { value: 'flat-color-icons:book', label: '书籍', category: 'education' },
        // { value: 'flat-color-icons:graduation-cap', label: '毕业帽', category: 'education' },
        // { value: 'flat-color-icons:school', label: '学校', category: 'education' },
        // { value: 'flat-color-icons:pencil', label: '铅笔', category: 'education' },
        // { value: 'flat-color-icons:calculator', label: '计算器', category: 'education' },
        
        // 住房类
        { value: 'fluent-emoji-flat:house', label: '房子', category: 'home' },
        // { value: 'flat-color-icons:apartment', label: '公寓', category: 'home' },
        // { value: 'flat-color-icons:key', label: '钥匙', category: 'home' },
        // { value: 'flat-color-icons:bed', label: '床', category: 'home' },
        // { value: 'flat-color-icons:sofa', label: '沙发', category: 'home' },
        // { value: 'flat-color-icons:lamp', label: '台灯', category: 'home' },
        
        // 通讯类
        // { value: 'flat-color-icons:phone', label: '智能', category: 'communication' },
        // { value: 'flat-color-icons:smartphone', label: '智能手机', category: 'communication' },
        // { value: 'flat-color-icons:email', label: '邮件', category: 'communication' },
        // { value: 'flat-color-icons:chat', label: '聊天', category: 'communication' },
        // { value: 'flat-color-icons:wifi', label: 'WiFi', category: 'communication' },
        // { value: 'flat-color-icons:antenna', label: '天线', category: 'communication' },
        
        // 工作类
        // { value: 'flat-color-icons:briefcase', label: '公文包', category: 'work' },
        // { value: 'flat-color-icons:office', label: '办公室', category: 'work' },
        // { value: 'flat-color-icons:computer', label: '电脑', category: 'work' },
        // { value: 'flat-color-icons:printer', label: '打印机', category: 'work' },
        // { value: 'flat-color-icons:calendar', label: '日历', category: 'work' },
        // { value: 'flat-color-icons:clock', label: '时钟', category: 'work' },
        
        // 其他类
        // { value: 'flat-color-icons:settings', label: '设置', category: 'other' },
        // { value: 'flat-color-icons:tools', label: '工具', category: 'other' },
        // { value: 'flat-color-icons:star', label: '星星', category: 'other' },
        // { value: 'flat-color-icons:heart', label: '心形', category: 'other' },
        // { value: 'flat-color-icons:flag', label: '旗帜', category: 'other' },
        // { value: 'flat-color-icons:globe', label: '地球', category: 'other' }
      ],
      filteredIcons: []
    }
  },
  computed: {
    filteredIconsByCategory() {
      if (this.selectedCategory === 'all') {
        return this.allIcons
      }
      return this.allIcons.filter(icon => icon.category === this.selectedCategory)
    },
    filteredIcons() {
      if (!this.searchKeyword) {
        return this.filteredIconsByCategory
      }
      return this.filteredIconsByCategory.filter(icon => 
        icon.label.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        icon.value.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    },
    selectedIconLabel() {
      if (!this.selectedIcon) return ''
      const icon = this.allIcons.find(item => item.value === this.selectedIcon)
      return icon ? icon.label : this.selectedIcon
    }
  },

  watch: {
    modelValue(newVal) {
      this.selectedIcon = newVal
    }
  },
  mounted() {
    this.filterIcons()
  },
  methods: {
    handleClose() {
      this.selectedIcon = this.modelValue
      this.showDialog = false
    },
    selectCategory(category) {
      this.selectedCategory = category
      this.filterIcons()
    },
    selectIcon(iconValue) {
      this.selectedIcon = iconValue
    },
    confirmSelection() {
      this.$emit('update:modelValue', this.selectedIcon)
      this.showDialog = false
      ElMessage.success('图标选择成功')
    },
    filterIcons() {
        // 过滤逻辑已移至computed属性中，此方法保留用于兼容性
      },
    getIconLabel(iconValue) {
      const icon = this.allIcons.find(item => item.value === iconValue)
      return icon ? icon.label : iconValue
    },
    handleIconError(icon) {
      console.warn(`图标加载失败: ${icon.value} (${icon.label})`)
    }
  }
}
</script>

<style scoped>
.icon-picker {
  display: inline-block;
}

.search-section {
  margin-bottom: 16px;
}

.category-tabs {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.category-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.icon-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.icon-item.active {
  border-color: #409eff;
  background-color: #409eff;
  color: #fff;
}

.icon-label {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  word-break: break-all;
}

.pagination-section {
  margin-top: 16px;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style>