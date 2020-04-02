<template>
  <el-form ref="form" :inline="true" class="demo-form-inline" label-width="70px">
    <el-form-item label="金标">
      <el-input v-model="form.anti_jin" placeholder="请输入个数"></el-input>
    </el-form-item>
    <el-form-item label="银标">
      <el-input v-model="form.anti_yin" placeholder="请输入个数"></el-input>
    </el-form-item>
    <el-form-item label="茶叶">
      <el-input v-model="form.anti_chaye" placeholder="请输入个数"></el-input>
    </el-form-item>
    <el-form-item label="激活码">
      <el-input v-model="form.actNum" placeholder="请输入个数"></el-input>
    </el-form-item>
    <el-form-item label="接收码">
      <el-input v-model="form.recNum" placeholder="请输入个数"></el-input>
    </el-form-item>

    <el-form-item label="批次名称">
      <el-input v-model="form.name" placeholder="请输入名称"></el-input>
    </el-form-item>
    <el-form-item label="批次备注">
      <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="form.note"></el-input>
    </el-form-item>

    <el-form-item style="text-align:center;display:block;margin:0 auto">
      <el-button type="primary" @click="onSubmit">立即创建</el-button>
      <el-button @click="close">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { queryData } from "@/api/common";
export default {
  data() {
    return {
      form: {
        anti_jin: "",
        anti_yin: "",
        anti_chaye: "",
        actNum: "",
        recNum: "",
        name: "",
        note: ""
      }
    };
  },
  methods: {
    onSubmit() {
      let param = Object.assign(this.form, {
        userId: localStorage.getItem("uid")
      });
      queryData("web/createBatch", param, "post").then(res => {
        console.log(res);
        if (res.code == 0) {
          this.$message.success("创建成功");
          this.$emit("changeBatch", false);
        } else {
          this.$message.error(res);
        }
      });
    },
    close() {
      this.$emit("changeBatch", false);
    }
  }
};
</script>
