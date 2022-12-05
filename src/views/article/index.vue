<template>
  <div class="article-page">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>面经后台</el-breadcrumb-item>
      <el-breadcrumb-item>面经管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never" border="false">
      <!-- 配置头部插槽 -->
      <template #header>
        <div class="header">
          <span>共 {{ total }} 条记录</span>
          <el-button
            @click="openDrawer('add')"
            icon="el-icon-plus"
            size="small"
            type="primary"
            round
          >
            添加面经
          </el-button>
        </div>
      </template>

      <!-- 内容部分
           el-table 表格
           el-table-column 表格的列 label 列名，prop 配置一列的值

           我们用的el-card, el-table-column这些其实都是element-ui封装好的组件
           我们使用组件, 组件内部的逻辑不用我们写, 需要关注组件怎么使用

           类比于: 别人可以封装好一系列函数, 函数内部的逻辑不用我写, 我只需要关注于函数怎么调用即可
      -->
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="stem" label="标题" width="400"></el-table-column>
        <el-table-column prop="creator" label="作者"></el-table-column>
        <el-table-column prop="likeCount" label="点赞"></el-table-column>
        <el-table-column prop="views" label="浏览数"></el-table-column>
        <el-table-column
          prop="createdAt"
          label="更新时间"
          width="200"
        ></el-table-column>

        <!-- 底层源码
             <div v-for="(item, index) in data">
               <slot name="default" :row="item" :$index="index"></slot>
             </div>
         -->
        <el-table-column label="操作">
          <!-- obj中有两个常用属性 => $index下标, row一行的数据对象 （遍历时的一个item） -->
          <template #default="{ row }">
            <!-- {{ obj.$index }} -->
            <!-- {{ obj.row.id }} -->
            <div class="actions">
              <i
                class="el-icon-view"
                @click="openDrawer('preview', row.id)"
              ></i>
              <i
                class="el-icon-edit-outline"
                @click="openDrawer('edit', row.id)"
              ></i>
              <i class="el-icon-delete" @click="del(row.id)"></i>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!--
        @size-change            每页条数变化，每页10条 => 每页20条
        @current-change         当前页变化，重新加载数据!
        :current-page="当前页"   绑定当前生效的是第几页!
        :page-sizes="[100, 200, 300, 400]" 可供选择的每页数据
        :page-size="100"         当前生效的每页条数!
        :total="值"              总数量!

        layout                   布局容器，设定有哪些控件展示在页面中
       -->
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page="current"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- drawer 往层放, 固定定位
         title 配置标题
         :visible.sync 绑定一个布尔值, 控制显示隐藏  (.sync修饰符 后面人资讲)
         direction="rtl" 从右侧弹出  right to left
         before-close 处理弹框关闭事件
    -->
    <el-drawer
      direction="rtl"
      size="50%"
      :title="drawerTitle"
      :visible.sync="isShowDrawer"
      :before-close="handleClose"
    >
      <div v-if="drawerType === 'preview'" class="article-preview">
        <h5>{{ form.stem }}</h5>
        <div v-html="form.content"></div>
      </div>

      <el-form
        v-else
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="stem">
          <el-input v-model="form.stem" placeholder="输入面经标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <!-- 注意: 这个quill-editor不是element的表单元素, 不受element的直接控制, blur无效的
               需要手动注册blur事件, 调用form的校验
          -->
          <quill-editor
            v-model="form.content"
            @blur="handleBlur"
          ></quill-editor>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">确认</el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import {
  createArticle,
  getArticleDetail,
  getArticleList,
  removeArticle,
  updateArticle
} from '@/api/article'
import { quillEditor } from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  name: 'article-page',
  components: {
    quillEditor
  },
  data () {
    return {
      list: [],
      current: 1, // 当前页
      pageSize: 5, // 每页条数
      total: 0, // 总条数
      isShowDrawer: false, // 默认不显示
      drawerType: 'add', // 弹框操作类型   默认没有打开弹框, 初始值为 'add' / add preview edit
      form: {
        stem: '', // 标题
        content: '' // content
      },
      rules: {
        stem: [{ required: true, message: '请输入面经标题', trigger: 'blur' }],
        content: [
          { required: true, message: '请输入面经标题', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    drawerTitle () {
      let title = '默认大标题'

      if (this.drawerType === 'add') title = '添加面经'
      if (this.drawerType === 'preview') title = '面经预览'
      if (this.drawerType === 'edit') title = '修改面经'

      return title
    }
  },
  async created () {
    this.initData()
  },
  methods: {
    // 根据当前页 和 每页条数，初始化数据
    async initData () {
      const { data } = await getArticleList({
        current: this.current,
        pageSize: this.pageSize
      })
      this.list = data.rows
      this.total = data.total
    },
    async del (id) {
      // console.log(id)
      await removeArticle(id)
      this.$message.success('删除成功')
      this.initData() // 重新渲染
    },
    handleCurrentChange (val) {
      // console.log(val)
      // 更新当前页
      this.current = val
      // 重新根据当前页 进行初始化数据
      this.initData()
    },
    async openDrawer (type, id) {
      // console.log(type, id)
      // type的值 add preview edit => 对应(自动)设置标题 => 计算属性
      this.drawerType = type // 显示弹框

      if (this.drawerType !== 'preview') {
        // add edit 调用 resetFields 在此处的作用: 重置校验状态
        this.$refs.form.resetFields()
      }

      // 除了添加, 编辑 和 预览, 都是要回显
      if (type !== 'add') {
        const res = await getArticleDetail(id)
        // 将res.data的所有数据, 展开到form中, 用于回显
        this.form = {
          ...res.data
        }
      }

      this.isShowDrawer = true
    },
    handleClose () {
      // 注意点: 由于公用的抽屉, 当预览时, 是没有表单的! 不能重置表单
      // 但是form的值还在, 会影响添加 => 需要手动重置一下
      // 关闭时将表单内容重置

      // 无论是哪种情况, 一律将form手动数据清零
      this.form = { stem: '', content: '' }

      this.isShowDrawer = false // 关闭弹框
    },
    handleBlur () {
      // console.log('失去焦点了')
      this.$refs.form.validateField('content')
    },
    async submit () {
      try {
        // 校验表单
        await this.$refs.form.validate()
        // 如何区分, 当前是 编辑 还是 添加
        if (this.drawerType === 'add') {
          // 发送请求
          await createArticle(this.form)
          // 添加提示 $message.success
          this.$message.success('添加成功')
        }
        if (this.drawerType === 'edit') {
          // 发送的是编辑的请求
          const { id, stem, content } = this.form
          await updateArticle({ id, stem, content })
          this.$message.success('修改成功')
        }
        // 无论是修改还是添加, 都会回到第一页, 重置页码
        this.current = 1
        // 重新渲染
        this.initData()
        // 关闭弹框
        this.handleClose()
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  margin-top: 25px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 16px;
  }
  .actions {
    font-size: 18px;
    display: flex;
    justify-content: space-around;
    color: #666;
    > i:hover {
      color: rgba(114, 124, 245, 1);
      cursor: pointer;
    }
  }
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
.el-breadcrumb {
  margin-top: 10px;
}
.el-form {
  padding-right: 40px;
}
.quill-editor {
  ::v-deep .ql-editor {
    height: 300px;
  }
}
.el-rate {
  padding: 10px 0;
}
.article-preview {
  padding: 0 40px 40px 40px;
  > h5 {
    font-size: 20px;
    color: #666;
    border-bottom: 1px dashed #ccc;
    padding-bottom: 30px;
    margin: 0 0 20px 0;
  }
}
</style>
