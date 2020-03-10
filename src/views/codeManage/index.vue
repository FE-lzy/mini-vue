<template>
  <div class="container">
    <el-form ref="form" class="formdiv" label-width="120px">
      <el-form-item label="防伪码类别">
        <el-select v-model="form.type" placeholder="请选择防伪码类别">
          <el-option label="金标" value="1"></el-option>
          <el-option label="银标" value="2"></el-option>
          <el-option label="茶叶" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数量">
        <el-input v-model="form.number" style="width:200px"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
    <el-button
      v-if="multipleSelection.length > 0"
      type="success"
      style="margin:20px"
      @click="handleSendPrinting"
    >发送至印刷厂</el-button>

    <el-form ref="form" class="formdiv" label-width="120px">
      <el-form-item label="状态">
        <el-select v-model="searchForm.state" @change="getAntiList" placeholder="请选择">
          <el-option label="全部" value="0"></el-option>
          <el-option label="已生成" value="1"></el-option>
          <el-option label="已发送至印刷厂" value="2"></el-option>
          <el-option label="印刷厂已接收" value="3"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="sn" label="sn"></el-table-column>
      <el-table-column prop="type" label="类型"></el-table-column>
      <el-table-column prop="state" label="状态"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" show-overflow-tooltip></el-table-column>
    </el-table>
    <el-pagination
      style="text-align:center;margin-top:20px;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[50,100, 200, 300, 400]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="listTotal"
    ></el-pagination>
  </div>
</template>
<script>
import { queryData } from "@/api/common";
export default {
  data() {
    return {
      form: {
        number: "",
        type: ""
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 50
      },
      multipleSelection: [],
      listTotal: 0,
      searchForm: {
        state: "1"
      }
    };
  },
  mounted() {
    this.getAntiList();
  },
  methods: {
    getAntiList() {
      console.log(this.searchForm.state);
      let param = {
        state: this.searchForm.state,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize
      };
      queryData("test/getAntiList", param, "post").then(res => {
        if (res.code == 0) {
          console.log(res);
          this.listTotal = res.data.total;
          this.tableData = res.data.data;
        }
      });
    },
    onSubmit() {
      let param = {
        number: this.form.number,
        type: this.form.type,
        state: 1,
        userId: 1
      };
      if (!this.form.number) {
        return this.$message.error("数量不能为空");
      }
      queryData("test/createAntiCode", param, "post").then(res => {
        if (res.code == 0) {
          this.$message.success("创建成功");
          this.getAntiList();
        }
      });
    },
    // 发送到印刷厂
    handleSendPrinting() {
      // let selects = [];
      // for (let i = 0; i < this.multipleSelection.length; i++) {
      //   selects[i].sn.push(this.multipleSelection[i].sn);
      // }
      console.log("选择的列", this.multipleSelection);
      let param = {
        selects: this.multipleSelection,
        userId: 1,
        state: 2
      };
      console.log(param);
      queryData("test/sendPrintRecord", param, "post")
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          this.$message.error(err);
        });
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      console.log("当前选择", val);
      this.multipleSelection = val;
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.getAntiList();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.getAntiList();
    }
  }
};
</script>
<style >
.container {
  margin: 20px 30px;
}
.formdiv {
  width: 500px;
}
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>