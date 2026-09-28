<template>
  <main class="manage-page">
    <header class="page-header">
      <button class="back-button" type="button" aria-label="返回" @click="$router.back()">‹</button>
      <h1>分组管理</h1>
      <button class="add-text" type="button" @click="openCreate">新增</button>
    </header>

    <section class="manage-content">
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="loading" class="state-message">正在加载分组...</p>
      <p v-else-if="groups.length === 0" class="state-message">还没有分组，点击右上角新增</p>
      <article v-for="group in groups" v-else :key="group.id" class="group-card">
        <div class="group-heading">
          <div class="group-symbol" aria-hidden="true">▦</div>
          <div class="group-copy"><h2>{{ group.name }}</h2><p>{{ group.description || '暂无描述' }}</p></div>
          <div class="group-actions">
            <button type="button" aria-label="编辑分组" @click="openEdit(group)">编辑</button>
            <button class="danger" type="button" aria-label="删除分组" @click="handleDelete(group)">删除</button>
          </div>
        </div>
        <div class="member-section">
          <div class="member-heading"><span>联系人 · {{ membersOf(group.id).length }}</span><button type="button" @click="openMemberPicker(group)">管理成员</button></div>
          <p v-if="membersOf(group.id).length === 0" class="empty-members">暂无联系人</p>
          <div v-else class="member-chips"><span v-for="contact in membersOf(group.id)" :key="contact.id" class="member-chip">{{ contact.name }}<button type="button" :aria-label="`从${group.name}移除${contact.name}`" @click="removeMember(group, contact)">×</button></span></div>
        </div>
      </article>
    </section>

    <div v-if="editorOpen" class="modal-backdrop" @click.self="editorOpen = false">
      <section class="editor-modal" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑分组' : '新增分组'">
        <header class="modal-header"><button type="button" @click="editorOpen = false">取消</button><h2>{{ editingId ? '编辑分组' : '新建分组' }}</h2><button class="save-action" type="button" :disabled="saving" @click="saveGroup">保存</button></header>
        <form class="editor-form" @submit.prevent="saveGroup">
          <label>分组名称<input v-model.trim="form.name" required maxlength="80" placeholder="请输入分组名称"></label>
          <label>分组描述<textarea v-model.trim="form.description" rows="4" maxlength="500" placeholder="添加分组描述"></textarea></label>
          <p v-if="editorError" class="error-message">{{ editorError }}</p>
        </form>
      </section>
    </div>

    <div v-if="pickerOpen" class="modal-backdrop" @click.self="pickerOpen = false">
      <section class="editor-modal picker-modal" role="dialog" aria-modal="true" aria-label="管理分组成员">
        <header class="modal-header"><button type="button" @click="pickerOpen = false">完成</button><h2>{{ activeGroup ? activeGroup.name : '分组成员' }}</h2><span></span></header>
        <div class="contact-options">
          <p v-if="contacts.length === 0" class="empty-members">暂无联系人可选</p>
          <label v-for="contact in contacts" :key="contact.id" class="contact-option"><span>{{ contact.name }}</span><input type="checkbox" :checked="isMember(contact.id)" @change="toggleMember(contact, $event.target.checked)"></label>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { addGroup, deleteGroup, getGroupList, updateGroup } from '@/api/group';
import { getContactList } from '@/api/contact';
import { addContactToGroup, getContactsOfGroup, removeContactFromGroup } from '@/api/contactGroup';

export default {
  data() {
    return {
      groups: [], contacts: [], membersByGroup: {}, loading: false, errorMessage: '',
      editorOpen: false, pickerOpen: false, activeGroup: null, editingId: null, saving: false, editorError: '',
      form: { name: '', description: '' }
    };
  },
  async mounted() {
    await Promise.all([this.loadGroups(), this.loadContacts()]);
  },
  methods: {
    // 载入分组并分别读取各分组的联系人成员。
    async loadGroups() {
      this.loading = true;
      try {
        const response = await getGroupList();
        this.groups = response.data.data || [];
        await Promise.all(this.groups.map(group => this.loadMembers(group.id)));
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = '分组加载失败，请稍后重试';
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
    async loadMembers(groupId) {
      try {
        const response = await getContactsOfGroup(groupId);
        this.membersByGroup = { ...this.membersByGroup, [groupId]: response.data.data || [] };
      } catch (error) {
        this.membersByGroup = { ...this.membersByGroup, [groupId]: [] };
        console.error(error);
      }
    },
    membersOf(groupId) {
      return this.membersByGroup[groupId] || [];
    },
    openCreate() {
      this.editingId = null;
      this.form = { name: '', description: '' };
      this.editorError = '';
      this.editorOpen = true;
    },
    openEdit(group) {
      this.editingId = group.id;
      this.form = { name: group.name || '', description: group.description || '' };
      this.editorError = '';
      this.editorOpen = true;
    },
    async saveGroup() {
      if (this.saving) return;
      this.saving = true;
      try {
        if (this.editingId) await updateGroup(this.editingId, this.form);
        else await addGroup(this.form);
        this.editorOpen = false;
        await this.loadGroups();
      } catch (error) {
        this.editorError = '保存失败，请检查填写内容后重试';
        console.error(error);
      } finally {
        this.saving = false;
      }
    },
    async handleDelete(group) {
      if (!window.confirm(`确定删除分组“${group.name}”吗？`)) return;
      try {
        await deleteGroup(group.id);
        this.groups = this.groups.filter(item => item.id !== group.id);
        const nextMembers = { ...this.membersByGroup };
        delete nextMembers[group.id];
        this.membersByGroup = nextMembers;
      } catch (error) {
        window.alert('删除失败，请稍后重试');
        console.error(error);
      }
    },
    openMemberPicker(group) {
      this.activeGroup = group;
      this.pickerOpen = true;
    },
    isMember(contactId) {
      return this.activeGroup ? this.membersOf(this.activeGroup.id).some(item => String(item.id) === String(contactId)) : false;
    },
    async toggleMember(contact, shouldAdd) {
      const group = this.activeGroup;
      if (!group) return;
      try {
        if (shouldAdd) await addContactToGroup(contact.id, group.id);
        else await removeContactFromGroup(contact.id, group.id);
        await this.loadMembers(group.id);
      } catch (error) {
        window.alert('成员更新失败，请稍后重试');
        console.error(error);
      }
    },
    async removeMember(group, contact) {
      if (!window.confirm(`将“${contact.name}”从“${group.name}”中移除？`)) return;
      try {
        await removeContactFromGroup(contact.id, group.id);
        await this.loadMembers(group.id);
      } catch (error) {
        window.alert('移除失败，请稍后重试');
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
.group-card { overflow: hidden; margin-bottom: 16px; border-radius: 12px; background: #fff; }
.group-heading { display: flex; align-items: center; gap: 12px; padding: 16px; }
.group-symbol { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; border-radius: 12px; color: #34c759; background: #eaf8ee; font-size: 22px; }
.group-copy { min-width: 0; flex: 1; }
.group-copy h2 { margin: 0 0 4px; font-size: 17px; }
.group-copy p { overflow: hidden; margin: 0; color: #8e8e93; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.group-actions { display: flex; flex-direction: column; gap: 7px; }
.group-actions button { padding: 2px; border: 0; color: #007aff; background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.group-actions .danger { color: #ff3b30; }
.member-section { padding: 12px 16px 14px; border-top: 1px solid #e5e5ea; }
.member-heading { display: flex; align-items: center; justify-content: space-between; color: #8e8e93; font-size: 13px; }
.member-heading button { border: 0; color: #007aff; background: transparent; font: inherit; cursor: pointer; }
.member-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.member-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 7px; color: #1c1c1e; background: #f2f2f7; font-size: 13px; }
.member-chip button { padding: 0; border: 0; color: #8e8e93; background: transparent; font-size: 17px; line-height: 1; cursor: pointer; }
.empty-members { margin: 10px 0 0; color: #aeaeb2; font-size: 13px; }
.state-message { padding: 48px 16px; color: #8e8e93; text-align: center; }
.error-message { padding: 12px 14px; border-radius: 10px; color: #ff3b30; background: #fff; font-size: 14px; }
.modal-backdrop { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.32); }
.editor-modal { width: min(100%, 480px); max-height: min(90vh, 720px); overflow: auto; border-radius: 14px; background: #f2f2f7; box-shadow: 0 18px 55px rgba(0,0,0,.2); }
.modal-header { position: sticky; top: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e5e5ea; background: rgba(242,242,247,.92); backdrop-filter: blur(15px); }
.modal-header h2 { margin: 0; font-size: 16px; }
.modal-header button { justify-self: start; border: 0; color: #007aff; background: transparent; font: inherit; cursor: pointer; }
.modal-header .save-action { justify-self: end; font-weight: 600; }
.editor-form { display: grid; gap: 12px; padding: 16px; }
.editor-form > label { display: grid; gap: 8px; padding: 12px; border-radius: 10px; color: #6d6d72; background: #fff; font-size: 13px; }
.editor-form input, .editor-form textarea { width: 100%; border: 0; outline: 0; color: #1c1c1e; background: transparent; font: inherit; font-size: 16px; }
.contact-options { padding: 8px 16px 16px; }
.contact-option { display: flex; align-items: center; justify-content: space-between; min-height: 52px; border-bottom: 1px solid #e5e5ea; font-size: 15px; }
.contact-option input { width: 19px; height: 19px; accent-color: #007aff; }
@media (max-width: 480px) { .group-heading { gap: 9px; padding: 13px 11px; } .group-symbol { width: 38px; height: 38px; flex-basis: 38px; } }
</style>
