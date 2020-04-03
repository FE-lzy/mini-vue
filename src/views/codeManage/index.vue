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
            v-if="scope.row.state == 2 && role == 2"
            @click="printScan(scope.row)"
            type="text"
            size="small"
          >下载</el-button>
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

    <el-dialog title="详情" :visible.sync="InfoVisible" width="30%">
      <div class="grid-content">
        <el-form label-position="left" inline class="demo-table-expand">
          <el-form-item label="防伪码">
            <span>{{batchDetailArr.anti}}</span>
          </el-form-item>
          <el-form-item label="激活码">
            <span>{{batchDetailArr.act}}</span>
          </el-form-item>
          <el-form-item label="接收码">
            <span>{{batchDetailArr.rec}}</span>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="InfoVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
    <el-dialog id="progress" title="进度" :visible.sync="progressVisible" width="20%">
      <el-progress type="circle" :percentage="percentage"></el-progress>
    </el-dialog>
  </div>
</template>
<script>
import { queryData } from "@/api/common";
import addModal from "./modal/add";
const JSZip = require("jszip");
const FileSaver = require("file-saver");
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
      role: "",
      InfoVisible: false,
      progressVisible: false,
      percentage: 0,
      batchDetailArr: {
        anti: "",
        act: "",
        rec: ""
      },
      scanImg: []
    };
  },
  mounted() {
    this.getBatch();
    this.role = JSON.parse(localStorage.getItem("userInfo")).role;
  },
  methods: {
    /**
     * 下载
     */
    async printScan(row) {
      let res = await queryData(
        "client/getBatchInfo",
        { batchId: row.id },
        "post"
      );
      console.log(res);
      let index = 0;
      let data = res.data;
      this.progressVisible = true;
      let count =
        data.antidata.length + data.actdata.length + data.recdata.length;
      let alldata = await this.totalData(
        data.antidata,
        data.actdata,
        data.recdata
      );
      for (let i = 0; i < count; i++) {
        // console.log("参数", alldata[i]);
        let data = await queryData("web/baseImg", alldata[i], "post");
        this.scanImg.push(data.data);
        // this.scanImg.push(this.$baseUrl + url.message.slice(1));
        this.percentage = Math.round(((i + 1) / count).toFixed(2) * 100);
      }

      this.StoreDowQrcode(this.scanImg);
      if (this.percentage == "100") {
        this.$message.success("下载成功");
        this.progressVisible = false;
      }
    },
    StoreDowQrcode(arr, blogTitle = "二维码") {
      console.log(arr);
      var zip = new JSZip();
      console.log("-------------", zip);
      var imgs = zip.folder(blogTitle);
      console.log("-------------imgs", imgs);
      var baseList = [];
      var _this = this;
      //var arr = ["/images/bg.png", "/images/bg1.png"];

      for (var i = 0; i < arr.length; i++) {
        console.log(arr[i].name);
        let name = arr[i].name; //图片名称
        let image = new Image();
        // 解决跨域 Canvas 污染问题
        image.setAttribute("crossOrigin", "anonymous");
        image.onload = function() {
          console.log('onload');
          let canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          console.log(canvas);
          let context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, image.width, image.height);
          let url = canvas.toDataURL(); // 得到图片的base64编码数据 let url =
          canvas.toDataURL("image/png");
          baseList.push({ name: name, img: url.substring(22) });
          console.log(baseList);
          if (baseList.length === arr.length) {
            if (baseList.length > 0) {
              _this.$notify({
                title: "成功",
                message: "即将下载",
                type: "success"
              });
              for (let k = 0; k < baseList.length; k++) {
                imgs.file(baseList[k].name + ".png", baseList[k].img, {
                  base64: true
                });
              }
              zip.generateAsync({ type: "blob" }).then(function(content) {
                // see FileSaver.js
                FileSaver.saveAs(content, blogTitle + ".zip");
              });
            } else {
              _this.$notify.error({
                title: "错误",
                message: "暂无图片可下载"
              });
            }
          }
        };
        image.src = arr[i].baseImg = `${arr[i].baseImg}`;
        console.log(image);
      }
    },
    totalData(anti, act, rec) {
      let antidata, actdata, recdata;
      antidata = anti.map(i => {
        return { sn: i.sn, type: 1 };
      });
      actdata = act.map(i => {
        return { sn: i.sn, type: 2 };
      });
      recdata = rec.map(i => {
        return { sn: i.sn, type: 3 };
      });
      return antidata.concat(actdata).concat(recdata);
    },
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
      this.InfoVisible = true;
      queryData("client/getBatchInfo", { batchId: row.id }, "post").then(
        res => {
          console.log(res);
          let data = res.data;
          this.batchDetailArr.anti = data.antidata
            ? data.antidata.length > 1
              ? data.antidata[0].sn +
                "——" +
                data.antidata[data.antidata.length - 1].sn
              : data.antidata[0].sn
            : " ";
          this.batchDetailArr.act = data.actdata
            ? data.actdata.length > 1
              ? data.actdata[0].sn +
                "——" +
                data.actdata[data.actdata.length - 1].sn
              : data.actdata[0].sn
            : " ";
          this.batchDetailArr.rec = data.recdata
            ? data.recdata.length > 1
              ? data.recdata[0].sn +
                "——" +
                data.recdata[data.recdata.length - 1].sn
              : data.recdata[0].sn
            : " ";
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
      if (param == false) {
        this.getBatch();
      }
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
<style lang="scss">
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
#progress {
  .el-dialog__body {
    text-align: center;
  }
}
</style>