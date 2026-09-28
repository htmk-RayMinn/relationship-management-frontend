<template>
  <main class="form-page">
    <header class="page-header">
      <button class="text-button" type="button" @click="goBack">取消</button>
      <h1>{{ isEdit ? '编辑联系人' : '新建联系人' }}</h1>
      <button class="text-button text-button--strong" type="button" :disabled="saving" @click="saveContact">
        {{ saving ? '保存中' : '保存' }}
      </button>
    </header>

    <form class="form-content" @submit.prevent="saveContact">
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <section class="form-card">
        <label class="field-row">
          <span>姓名</span>
          <input v-model.trim="form.name" type="text" maxlength="80" placeholder="请输入姓名" required>
        </label>
        <label class="field-row">
          <span>生日</span>
          <input v-model="form.birthDate" type="date">
        </label>
        <label class="field-row field-row--last">
          <span>性别</span>
          <select v-model="form.gender">
            <option value="">未设置</option>
            <option value="M">男</option>
            <option value="F">女</option>
            <option value="其他">其他</option>
          </select>
        </label>
      </section>

      <section class="form-card">
        <label class="field-row field-row--stacked field-row--last">
          <span>地址</span>
          <textarea v-model.trim="form.address" rows="2" maxlength="300" placeholder="添加地址"></textarea>
        </label>
      </section>

      <section class="form-card">
        <label class="field-row field-row--stacked field-row--last">
          <span>备注</span>
          <textarea v-model.trim="form.notes" rows="4" maxlength="1000" placeholder="添加备注"></textarea>
        </label>
      </section>
    </form>
  </main>
</template>

<script>
import { addContact, getContactById, updateContact } from '@/api/contact';

export default {
  data() {
    return {
      form: { name: '', birthDate: '', gender: '', address: '', notes: '' },
      saving: false,
      errorMessage: ''
    };
  },
  computed: {
    isEdit() {
      return Boolean(this.$route.params.id);
    }
  },
  async mounted() {
    if (this.isEdit) await this.loadContact();
  },
  methods: {
    // 编辑模式下先载入联系人现有资料。
    async loadContact() {
      try {
        const response = await getContactById(this.$route.params.id);
        this.form = { ...this.form, ...(response.data.data || {}) };
      } catch (error) {
        this.errorMessage = '联系人资料加载失败，请返回重试';
        console.error(error);
      }
    },
    // 根据当前路由选择新增或更新接口。
    async saveContact() {
      if (!this.form.name || this.saving) return;
      this.saving = true;
      this.errorMessage = '';

      try {
        if (this.isEdit) {
          await updateContact(this.$route.params.id, this.form);
          this.$router.push('/contact/' + this.$route.params.id);
        } else {
          await addContact(this.form);
          this.$router.push('/');
        }
      } catch (error) {
        this.errorMessage = '保存失败，请检查网络后重试';
        console.error(error);
      } finally {
        this.saving = false;
      }
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.form-page { min-height: 100vh; padding-bottom: 36px; color: #1c1c1e; background: #f2f2f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif; }
.page-header { position: sticky; top: 0; z-index: 2; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 56px; padding: 0 18px; border-bottom: 1px solid rgba(60, 60, 67, .12); background: rgba(242, 242, 247, .82); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.page-header h1 { margin: 0; font-size: 17px; font-weight: 600; }
.text-button { justify-self: start; padding: 8px 0; border: 0; color: #007aff; background: transparent; font: inherit; font-size: 16px; cursor: pointer; }
.text-button--strong { justify-self: end; font-weight: 600; }
.text-button:disabled { opacity: .5; }
.form-content { width: min(100% - 32px, 620px); margin: 26px auto; }
.form-card { overflow: hidden; margin-bottom: 20px; border-radius: 12px; background: #fff; }
.field-row { display: flex; align-items: center; min-height: 56px; margin-left: 16px; padding: 0 16px 0 0; border-bottom: 1px solid #e5e5ea; }
.field-row--last { border-bottom: 0; }
.field-row > span { width: 76px; flex: 0 0 76px; font-size: 15px; }
.field-row input, .field-row select, .field-row textarea { width: 100%; min-width: 0; border: 0; outline: 0; color: #1c1c1e; background: transparent; font: inherit; font-size: 16px; }
.field-row input::placeholder, .field-row textarea::placeholder { color: #aeaeb2; }
.field-row select { text-align: right; }
.field-row--stacked { display: block; padding: 15px 16px 14px 0; }
.field-row--stacked > span { display: block; width: auto; margin-bottom: 10px; }
.field-row textarea { resize: vertical; line-height: 1.5; }
.error-message { padding: 12px 14px; border-radius: 10px; color: #ff3b30; background: #fff; }
@media (max-width: 480px) { .form-content { margin-top: 20px; } }
</style>
