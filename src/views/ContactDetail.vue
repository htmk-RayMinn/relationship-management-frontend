<template>
  <main class="detail-page">
    <header class="page-header">
      <button class="back-button" type="button" aria-label="返回联系人列表" @click="$router.push('/')">‹</button>
      <h1>联系人详情</h1>
      <button v-if="contact" class="edit-button" type="button" @click="$router.push(`/contact/${contact.id}/edit`)">编辑</button>
    </header>

    <section v-if="loading" class="state-message">正在加载联系人...</section>
    <section v-else-if="errorMessage" class="state-message state-message--error">{{ errorMessage }}</section>
    <div v-else-if="contact" class="detail-content">
      <section class="identity">
        <div class="avatar">{{ contact.name ? contact.name.trim().charAt(0) : '?' }}</div>
        <h2>{{ contact.name || '未命名联系人' }}</h2>
        <p>{{ genderLabel(contact.gender) }}<span v-if="contact.birthDate || contact.birth_date"> · {{ contact.birthDate || contact.birth_date }}</span></p>
      </section>

      <section class="detail-card">
        <div class="detail-row">
          <span class="row-label">地址</span>
          <span class="row-value">{{ contact.address || '未填写' }}</span>
        </div>
        <div class="detail-row detail-row--last">
          <span class="row-label">备注</span>
          <span class="row-value">{{ contact.notes || '未填写' }}</span>
        </div>
      </section>

      <section class="section-heading">
        <h2>账号</h2>
        <button type="button" @click="$router.push('/accounts')">管理账号 ›</button>
      </section>
      <section class="detail-card">
        <p v-if="accounts.length === 0" class="empty-row">暂无关联账号</p>
        <div v-for="(account, index) in accounts" :key="account.id" class="account-row" :class="{ 'detail-row--last': index === accounts.length - 1 }">
          <div class="account-mark">{{ (account.platformName || '?').charAt(0) }}</div>
          <div class="account-copy">
            <strong>{{ account.platformName || '其他平台' }}<span v-if="Number(account.isPrimary) === 1" class="primary-tag">主要</span></strong>
            <span>{{ account.account }}</span>
          </div>
        </div>
      </section>

      <section class="section-heading">
        <h2>所属分组</h2>
        <button type="button" @click="$router.push('/groups')">管理分组 ›</button>
      </section>
      <section class="detail-card group-list">
        <p v-if="groups.length === 0" class="empty-row">尚未加入分组</p>
        <span v-for="group in groups" :key="group.id" class="group-chip">{{ group.name }}</span>
      </section>
    </div>
  </main>
</template>

<script>
import { getContactById } from '@/api/contact';
import { getAccountsOfContact } from '@/api/accout';
import { getGroupsOfContact } from '@/api/contactGroup';

export default {
  data() {
    return { contact: null, accounts: [], groups: [], loading: true, errorMessage: '' };
  },
  async mounted() {
    await this.loadDetails();
  },
  methods: {
    // 同时载入联系人资料及其账号、分组关联。
    async loadDetails() {
      this.loading = true;
      try {
        const contactId = this.$route.params.id;
        const [contactResponse, accountResponse, groupResponse] = await Promise.all([
          getContactById(contactId),
          getAccountsOfContact(contactId),
          getGroupsOfContact(contactId)
        ]);
        this.contact = contactResponse.data.data;
        this.accounts = accountResponse.data.data || [];
        this.groups = groupResponse.data.data || [];
      } catch (error) {
        this.errorMessage = '联系人详情加载失败，请稍后重试';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    genderLabel(gender) {
      if (gender === 'M') return '男';
      if (gender === 'F') return '女';
      return gender || '性别未设置';
    }
  }
};
</script>

<style scoped>
.detail-page { min-height: 100vh; padding-bottom: 40px; color: #1c1c1e; background: #f2f2f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif; }
.page-header { position: sticky; top: 0; z-index: 2; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 56px; padding: 0 18px; border-bottom: 1px solid rgba(60,60,67,.12); background: rgba(242,242,247,.82); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.page-header h1 { margin: 0; font-size: 17px; font-weight: 600; }
.back-button, .edit-button { border: 0; color: #007aff; background: transparent; font: inherit; cursor: pointer; }
.back-button { justify-self: start; padding: 0 10px 4px 0; font-size: 34px; line-height: 1; }
.edit-button { justify-self: end; font-size: 16px; }
.detail-content { width: min(100% - 32px, 620px); margin: 22px auto; }
.identity { display: flex; flex-direction: column; align-items: center; padding: 18px 0 24px; }
.avatar { display: grid; width: 82px; height: 82px; place-items: center; border-radius: 50%; color: white; background: #007aff; font-size: 36px; font-weight: 600; }
.identity h2 { margin: 12px 0 4px; font-size: 24px; }
.identity p { margin: 0; color: #8e8e93; font-size: 14px; }
.detail-card { overflow: hidden; margin-bottom: 25px; border-radius: 12px; background: white; }
.detail-row { display: flex; gap: 20px; margin-left: 16px; padding: 15px 16px 15px 0; border-bottom: 1px solid #e5e5ea; line-height: 1.45; }
.detail-row--last { border-bottom: 0; }
.row-label { width: 60px; flex: 0 0 60px; color: #8e8e93; font-size: 14px; }
.row-value { min-width: 0; overflow-wrap: anywhere; font-size: 15px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin: 0 2px 10px; }
.section-heading h2 { margin: 0; color: #6d6d72; font-size: 14px; font-weight: 600; }
.section-heading button { padding: 4px 0; border: 0; color: #007aff; background: transparent; font: inherit; font-size: 14px; cursor: pointer; }
.account-row { display: flex; align-items: center; gap: 12px; margin-left: 16px; padding: 12px 16px 12px 0; border-bottom: 1px solid #e5e5ea; }
.account-row:last-child { border-bottom: 0; }
.account-mark { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 10px; color: #007aff; background: #eaf3ff; font-weight: 600; }
.account-copy { display: flex; min-width: 0; flex-direction: column; gap: 4px; font-size: 14px; }
.account-copy > span { overflow: hidden; color: #8e8e93; text-overflow: ellipsis; white-space: nowrap; }
.primary-tag { margin-left: 8px; padding: 2px 6px; border-radius: 5px; color: #007aff; background: #eaf3ff; font-size: 11px; font-weight: 500; }
.empty-row { margin: 0; padding: 17px; color: #8e8e93; font-size: 14px; }
.group-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px; }
.group-chip { padding: 7px 10px; border-radius: 8px; color: #007aff; background: #eaf3ff; font-size: 14px; }
.state-message { padding: 56px 18px; color: #8e8e93; text-align: center; }
.state-message--error { color: #ff3b30; }
</style>
