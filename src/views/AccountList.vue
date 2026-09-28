<template>
  <main class="manage-page">
    <header class="page-header">
      <button class="back-button" type="button" aria-label="返回" @click="$router.back()">‹</button>
      <h1>账号管理</h1>
      <button class="add-text" type="button" @click="openCreate">新增</button>
    </header>

    <div class="manage-content">
      <label class="search-box"><span aria-hidden="true">⌕</span><input v-model.trim="keyword" type="search" placeholder="搜索平台或账号" @input="loadAccounts"></label>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="loading" class="state-message">正在加载账号...</p>
      <p v-else-if="accounts.length === 0" class="state-message">{{ keyword ? '没有找到匹配账号' : '还没有账号' }}</p>

      <section v-else class="item-list">
        <article v-for="account in accounts" :key="account.id" class="account-item">
          <div class="platform-icon">{{ (account.platformName || '?').charAt(0) }}</div>
          <div class="account-info">
            <h2>{{ account.platformName || '其他平台' }} <span v-if="Number(account.isPrimary) === 1" class="primary-label">主要</span></h2>
            <p>{{ account.account }}</p>
            <p v-if="contactName(account.contactId)" class="muted">{{ contactName(account.contactId) }}</p>
            <p v-if="account.notes" class="muted">{{ account.notes }}</p>
          </div>
          <div class="item-actions">
            <button type="button" aria-label="编辑账号" @click="openEdit(account)">编辑</button>
            <button class="danger" type="button" aria-label="删除账号" @click="handleDelete(account)">删除</button>
          </div>
        </article>
      </section>
    </div>

    <div v-if="editorOpen" class="modal-backdrop" @click.self="editorOpen = false">
      <section class="editor-modal" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑账号' : '新增账号'">
        <header class="modal-header"><button type="button" @click="editorOpen = false">取消</button><h2>{{ editingId ? '编辑账号' : '新增账号' }}</h2><button class="save-action" type="button" :disabled="saving" @click="saveAccount">保存</button></header>
        <form class="editor-form" @submit.prevent="saveAccount">
          <label>平台名称<input v-model.trim="form.platformName" required maxlength="60" placeholder="如：微信"></label>
          <label>账号内容<input v-model.trim="form.account" required maxlength="200" placeholder="账号或号码"></label>
          <label>关联联系人<select v-model="form.contactId"><option value="">不关联</option><option v-for="contact in contacts" :key="contact.id" :value="contact.id">{{ contact.name }}</option></select></label>
          <label class="check-row"><input v-model="form.isPrimary" type="checkbox">设为主要账号</label>
          <label>备注<textarea v-model.trim="form.notes" rows="3" maxlength="500" placeholder="可选"></textarea></label>
          <p v-if="editorError" class="error-message">{{ editorError }}</p>
        </form>
      </section>
    </div>
  </main>
</template>

<script>
import { addAccount, deleteAccount, getAccountList, searchAccount, updateAccount } from '@/api/accout';
import { getContactList } from '@/api/contact';

export default {
  data() {
    return {
      accounts: [], contacts: [], keyword: '', loading: false, errorMessage: '',
      editorOpen: false, editingId: null, saving: false, editorError: '',
      form: { platformName: '', account: '', contactId: '', isPrimary: false, notes: '' }
    };
  },
  async mounted() {
    await Promise.all([this.loadAccounts(), this.loadContacts()]);
  },
  methods: {
    // 按搜索词调用对应账号接口。
    async loadAccounts() {
      this.loading = true;
      try {
        const response = this.keyword ? await searchAccount(this.keyword) : await getAccountList();
        this.accounts = response.data.data || [];
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = '账号加载失败，请稍后重试';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async loadContacts() {
      try {
        const response = await getContactList();
        this.contacts = response.data.data || [];
      } catch (error) {
        console.error(error);
      }
    },
    contactName(id) {
      const contact = this.contacts.find(item => String(item.id) === String(id));
      return contact ? contact.name : '';
    },
    openCreate() {
      this.editingId = null;
      this.form = { platformName: '', account: '', contactId: '', isPrimary: false, notes: '' };
      this.editorError = '';
      this.editorOpen = true;
    },
    openEdit(account) {
      this.editingId = account.id;
      this.form = { platformName: account.platformName || '', account: account.account || '', contactId: account.contactId ?? '', isPrimary: Number(account.isPrimary) === 1, notes: account.notes || '' };
      this.editorError = '';
      this.editorOpen = true;
    },
    async saveAccount() {
      if (this.saving) return;
      this.saving = true;
      this.editorError = '';
      const payload = { ...this.form, contactId: this.form.contactId === '' ? null : this.form.contactId, isPrimary: this.form.isPrimary ? 1 : 0 };
      try {
        if (this.editingId) await updateAccount(this.editingId, payload);
        else await addAccount(payload);
        this.editorOpen = false;
        await this.loadAccounts();
      } catch (error) {
        this.editorError = '保存失败，请检查填写内容后重试';
        console.error(error);
      } finally {
        this.saving = false;
      }
    },
    async handleDelete(account) {
      if (!window.confirm(`确定删除“${account.platformName}”账号吗？`)) return;
      try {
        await deleteAccount(account.id);
        this.accounts = this.accounts.filter(item => item.id !== account.id);
      } catch (error) {
        window.alert('删除失败，请稍后重试');
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.manage-page { min-height: 100vh; padding-bottom: 32px; color: #1c1c1e; background: #f2f2f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif; }
.page-header { position: sticky; top: 0; z-index: 3; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 56px; padding: 0 18px; border-bottom: 1px solid rgba(60,60,67,.12); background: rgba(242,242,247,.82); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.page-header h1 { margin: 0; font-size: 17px; font-weight: 600; }
.back-button, .add-text { border: 0; color: #007aff; background: transparent; font: inherit; cursor: pointer; }
.back-button { justify-self: start; padding: 0 10px 4px 0; font-size: 34px; line-height: 1; }
.add-text { justify-self: end; font-size: 16px; }
.manage-content { width: min(100% - 32px, 680px); margin: 22px auto; }
.search-box { display: flex; align-items: center; gap: 8px; height: 42px; margin-bottom: 18px; padding: 0 12px; border-radius: 11px; background: rgba(118,118,128,.12); color: #8e8e93; }
.search-box span { font-size: 23px; }
.search-box input { width: 100%; border: 0; outline: 0; color: #1c1c1e; background: transparent; font: inherit; font-size: 16px; }
.item-list { overflow: hidden; border-radius: 12px; background: #fff; }
.account-item { display: flex; align-items: center; gap: 12px; padding: 15px; border-bottom: 1px solid #e5e5ea; }
.account-item:last-child { border-bottom: 0; }
.platform-icon { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; border-radius: 12px; color: #007aff; background: #eaf3ff; font-size: 20px; font-weight: 600; }
.account-info { min-width: 0; flex: 1; }
.account-info h2 { margin: 0 0 4px; font-size: 16px; }
.account-info p { overflow: hidden; margin: 3px 0 0; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
.muted { color: #8e8e93; font-size: 12px !important; }
.primary-label { margin-left: 6px; padding: 2px 6px; border-radius: 5px; color: #007aff; background: #eaf3ff; font-size: 11px; font-weight: 500; }
.item-actions { display: flex; flex-direction: column; gap: 8px; }
.item-actions button { padding: 4px; border: 0; color: #007aff; background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.item-actions .danger { color: #ff3b30; }
.state-message { padding: 48px 16px; color: #8e8e93; text-align: center; }
.error-message { padding: 12px 14px; border-radius: 10px; color: #ff3b30; background: #fff; font-size: 14px; }
.modal-backdrop { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.32); }
.editor-modal { width: min(100%, 480px); max-height: min(90vh, 720px); overflow: auto; border-radius: 14px; background: #f2f2f7; box-shadow: 0 18px 55px rgba(0,0,0,.2); }
.modal-header { position: sticky; top: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e5e5ea; background: rgba(242,242,247,.92); backdrop-filter: blur(15px); }
.modal-header h2 { margin: 0; font-size: 16px; }
.modal-header button { justify-self: start; border: 0; color: #007aff; background: transparent; font: inherit; cursor: pointer; }
.modal-header .save-action { justify-self: end; font-weight: 600; }
.editor-form { display: grid; gap: 12px; padding: 16px; }
.editor-form > label:not(.check-row) { display: grid; gap: 8px; padding: 12px; border-radius: 10px; background: #fff; font-size: 13px; color: #6d6d72; }
.editor-form input:not([type=checkbox]), .editor-form select, .editor-form textarea { width: 100%; border: 0; outline: 0; color: #1c1c1e; background: transparent; font: inherit; font-size: 16px; }
.check-row { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: #fff; font-size: 15px; }
.check-row input { width: 18px; height: 18px; accent-color: #007aff; }
@media (max-width: 480px) { .account-item { align-items: flex-start; gap: 9px; padding: 13px 11px; } .platform-icon { width: 38px; height: 38px; flex-basis: 38px; } .item-actions button { font-size: 12px; } }
</style>
