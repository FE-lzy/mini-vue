<template>
  <div>
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
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 50
      }
    };
  },
  methods: {
    getAntiList() {
      let param = {
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize
      };
      queryData("web/getBatchList", param, "post").then(res => {
        if (res.code == 0) {
          console.log(res);
          this.listTotal = res.data.total;
          this.tableData = res.data.data;
        }
      });
    }
  }
};
</script>