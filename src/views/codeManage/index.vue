<template>
  <div class="container">
    <el-button>当前用户：{{role == 1 ? '管理员': '印刷厂'}}</el-button>
    <el-button type="primary" v-if="role == 1" @click="changeBatch(true)">新增</el-button>
    <el-dialog title="新建" :visible.sync="visible.addFormVisible" width="60%">
      <addModal @changeBatch="changeBatch"></addModal>
    </el-dialog>
    <!-- <el-form ref="form" class="formdiv" label-width="120px">
      <el-form-item label="状态">
        <el-select v-model="searchForm.state" @change="getBatch" placeholder="请选择">
          <el-option label="全部" value="0"></el-option>
          <el-option label="已生成" value="1"></el-option>
          <el-option label="已发送至印刷厂" value="2"></el-option>
          <el-option label="印刷厂已接收" value="3"></el-option>
        </el-select>
      </el-form-item>
    </el-form>-->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="anti_jin" label="金标(个)"></el-table-column>
      <el-table-column prop="anti_yin" label="银标(个)"></el-table-column>
      <el-table-column prop="anti_chaye" label="茶叶(个)"></el-table-column>
      <el-table-column prop="actNum" label="激活码(个)"></el-table-column>
      <el-table-column prop="recNum" label="接收码(个)"></el-table-column>
      <el-table-column prop="state" label="状态" :formatter="statusFormat"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip :formatter="dateFormat"></el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button
            type="text"
            size="small"
            v-if="scope.row.state == 1 && role == 1"
            @click="addRecord(scope.row.id,2)"
          >发送至印刷厂</el-button>
          <el-button
            type="text"
            size="small"
            v-if=" scope.row.state == 2  && role == 2"
            @click="addRecord(scope.row.id,3)"
          >接收二维码</el-button>
          <el-button
            type="text"
            size="small"
            v-if=" scope.row.state == 3  && role == 2"
            @click="addRecord(scope.row.id,4)"
          >发送二维码</el-button>
          <el-button
            type="text"
            size="small"
            v-if=" scope.row.state == 4  && role == 1"
            @click="addRecord(scope.row.id,5)"
          >接收二维码</el-button>
        </template>
      </el-table-column>
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
import addModal from "./modal/add";
export default {
  components: {
    addModal
  },
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
      },
      visible: {
        addFormVisible: false
      },
      role: ""
    };
  },
  mounted() {
    this.getBatch();
    this.role = localStorage.getItem("role");
  },
  methods: {
    dateFormat(row, column) {
      var dateee = new Date(row.createTime).toJSON();
      return new Date(+new Date(dateee) + 8 * 3600 * 1000)
        .toISOString()
        .replace(/T/g, " ")
        .replace(/\.[\d]{3}Z/, "");
    },
    statusFormat(row, column) {
      if (row.state == 1) {
        return "已生成二维码";
      } else if (row.state == 2) {
        return "已发送二维码至印刷厂";
      } else if (row.state == 3) {
        return "印刷厂已接收";
      } else if (row.state == 4) {
        return "印刷厂已移交";
      } else if (row.state == 5) {
        return "二维码已接收";
      } else if (row.state == 6) {
        return "已发送至茶叶协会";
      } else if (row.state == 7) {
        return "茶叶协会已激活";
      } else {
        return "商户已激活";
      }
    },
    handleClick(row) {
      console.log(row);
      queryData("client/getBatchInfo", { batchId: row.id }, "post").then(
        res => {
          console.log(res);
        }
      );
    },
    getBatch() {
      console.log(localStorage.getItem("role"));
      let param = {
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        role: localStorage.getItem("role")
      };
      queryData("web/getBatchList", param, "post").then(res => {
        if (res.code == 0) {
          console.log(res);
          this.listTotal = res.data.total;
          this.tableData = res.data.data;
        }
      });
    },
    changeBatch(param) {
      this.visible.addFormVisible = param;
    },
    closeAddBatch() {
      console.log("object");
      this.visible.addFormVisible = false;
    },

    // 新增记录
    addRecord(row, state) {
      let param = {
        batchId: row,
        userId: localStorage.getItem("uid"),
        state
      };
      console.log(param);
      queryData("web/addRecordByBatch", param, "post")
        .then(res => {
          console.log(res);
          this.$message.success("发送成功");
          this.getBatch();
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
      this.getBatch();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.getBatch();
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