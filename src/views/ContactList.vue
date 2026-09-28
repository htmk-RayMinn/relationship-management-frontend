<template>
  <main class="contact-page">
        <header class="top-bar">
          <div class="top-bar__content">
            <p class="eyebrow">个人联系人</p>
            <h1>联系人</h1>
            <div class="search-box">
              <span class="search-icon" aria-hidden="true">⌕</span>
              <input
                v-model.trim="keyword"
                type="search"
                placeholder="搜索联系人"
                aria-label="搜索联系人"
                @input="handleSearch"
              >
              <button v-if="keyword" class="clear-button" type="button" aria-label="清空搜索" @click="clearSearch">×</button>
            </div>
          </div>
        </header>

        <section class="contact-content" aria-live="polite">
          <nav class="management-links" aria-label="管理工具">
            <button type="button" @click="$router.push('/accounts')">账号管理 <span>›</span></button>
            <button type="button" @click="$router.push('/groups')">分组管理 <span>›</span></button>
          </nav>
          <p v-if="loading" class="state-message">正在加载联系人...</p>
          <p v-else-if="errorMessage" class="state-message state-message--error">{{ errorMessage }}</p>
          <p v-else-if="contactList.length === 0" class="state-message">
            {{ keyword ? '没有找到匹配的联系人' : '还没有联系人' }}
          </p>

          <div v-else class="contact-card">
            <article
              v-for="(contact, index) in contactList"
              :key="contact.id"
              class="contact-item"
              :class="{ 'contact-item--last': index === contactList.length - 1 }"
              role="button"
              tabindex="0"
              @click="goToDetail(contact.id)"
              @keyup.enter="goToDetail(contact.id)"
            >
              <div class="contact-avatar" aria-hidden="true">{{ getInitial(contact.name) }}</div>
              <div class="contact-info">
                <h2>{{ contact.name || '未命名联系人' }}</h2>
                <p class="contact-meta">
                  <span v-if="contact.gender">{{ contact.gender }}</span>
                  <span v-if="getBirthDate(contact)">{{ formatDate(getBirthDate(contact)) }}</span>
                  <span v-if="contact.address">{{ contact.address }}</span>
                </p>
                <p v-if="contact.notes" class="contact-notes">{{ contact.notes }}</p>
              </div>
              <button
                class="delete-button"
                type="button"
                aria-label="删除联系人"
                @click.stop="handleDelete(contact)"
              >删除</button>
              <span class="chevron" aria-hidden="true">›</span>
            </article>
          </div>
        </section>

        <button class="add-button" type="button" aria-label="新增联系人" @click="goToAdd">+</button>
      </main>
</template>

<script>
    import { deleteContact, getContactList, searchContact } from '@/api/contact';

    export default {
      data() {
        return {
          contactList: [],
          keyword: '',
          loading: false,
          errorMessage: ''
        };
      },
      async mounted() {
        await this.loadContacts();
      },
      methods: {
        // 统一处理联系人列表请求，保证页面只使用接口返回的 data 数据。
        async loadContacts() {
          this.loading = true;
          this.errorMessage = '';

          try {
            const response = this.keyword
              ? await searchContact(this.keyword)
              : await getContactList();
            this.contactList = response.data.data || [];
          } catch (error) {
            this.errorMessage = '联系人列表加载失败，请稍后重试';
            console.error(error);
          } finally {
            this.loading = false;
          }
        },
        // 输入关键词后实时调用搜索接口。
        async handleSearch() {
          await this.loadContacts();
        },
        clearSearch() {
          this.keyword = '';
          this.loadContacts();
        },
        goToDetail(id) {
          this.$router.push('/contact/' + id);
        },
        goToAdd() {
          this.$router.push('/contact/add');
        },
        async handleDelete(contact) {
          if (!window.confirm(`确定要删除联系人“${contact.name || '未命名联系人'}”吗？`)) {
            return;
          }

          try {
            await deleteContact(contact.id);
            this.contactList = this.contactList.filter(item => item.id !== contact.id);
          } catch (error) {
            window.alert('删除失败，请稍后重试');
            console.error(error);
          }
        },
        getInitial(name) {
          return name ? name.trim().charAt(0) : '?';
        },
        getBirthDate(contact) {
          return contact.birthDate || contact.birth_date || '';
        },
        formatDate(date) {
          return date ? date.replace(/-/g, '/') : '';
        }
      }
    };
    </script>

    <style scoped>
    .contact-page {
      min-height: 100vh;
      padding-bottom: 110px;
      color: #1c1c1e;
      background: #f2f2f7;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif;
    }

    .top-bar {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 24px 20px 18px;
      border-bottom: 1px solid rgba(60, 60, 67, 0.12);
      background: rgba(242, 242, 247, 0.78);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .top-bar__content,
    .contact-content {
      width: min(100%, 720px);
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 4px;
      color: #8e8e93;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    h1 {
      margin: 0 0 18px;
      font-size: 34px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .search-box {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      border-radius: 11px;
      background: rgba(118, 118, 128, 0.12);
    }

    .search-icon {
      margin-right: 7px;
      color: #8e8e93;
      font-size: 25px;
      line-height: 1;
      transform: rotate(-20deg);
    }

    .search-box input {
      min-width: 0;
      flex: 1;
      border: 0;
      outline: 0;
      color: #1c1c1e;
      background: transparent;
      font: inherit;
      font-size: 16px;
    }

    .search-box input::placeholder { color: #8e8e93; }

    .clear-button {
      width: 22px;
      height: 22px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: #fff;
      background: #8e8e93;
      font-size: 17px;
      line-height: 18px;
      cursor: pointer;
    }

    .contact-content { padding: 24px 20px; }

    .management-links { display: flex; gap: 10px; margin-bottom: 16px; }
    .management-links button { display: flex; flex: 1; align-items: center; justify-content: space-between; padding: 12px 14px; border: 0; border-radius: 11px; color: #007aff; background: #fff; font: inherit; font-size: 14px; cursor: pointer; }
    .management-links span { color: #c7c7cc; font-size: 20px; line-height: 1; }

    .contact-card {
      overflow: hidden;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .contact-item {
      display: flex;
      align-items: center;
      min-height: 92px;
      margin-left: 18px;
      padding: 14px 18px 14px 0;
      border-bottom: 1px solid #e5e5ea;
      cursor: pointer;
    }

    .contact-item--last { border-bottom: 0; }

    .contact-item:focus-visible {
      outline: 3px solid rgba(0, 122, 255, 0.3);
      outline-offset: -3px;
    }

    .contact-avatar {
      display: grid;
      width: 48px;
      height: 48px;
      flex: 0 0 48px;
      place-items: center;
      margin-right: 13px;
      border-radius: 50%;
      color: #fff;
      background: #007aff;
      font-size: 21px;
      font-weight: 600;
    }

    .contact-info { min-width: 0; flex: 1; }
    .contact-info h2 { margin: 0 0 5px; font-size: 17px; font-weight: 600; }
    .contact-meta,
    .contact-notes { overflow: hidden; margin: 0; color: #8e8e93; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
    .contact-meta { display: flex; gap: 8px; }
    .contact-meta span + span::before { content: '·'; margin-right: 8px; color: #c7c7cc; }
    .contact-notes { margin-top: 4px; }

    .delete-button {
      margin-left: 10px;
      padding: 7px 9px;
      border: 0;
      border-radius: 8px;
      color: #ff3b30;
      background: #fff1f0;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }

    .chevron { margin-left: 10px; color: #c7c7cc; font-size: 27px; line-height: 1; }
    .state-message { padding: 48px 16px; color: #8e8e93; text-align: center; }
    .state-message--error { color: #ff3b30; }

    .add-button {
      position: fixed;
      right: max(24px, calc((100vw - 720px) / 2 + 20px));
      bottom: 28px;
      z-index: 5;
      width: 58px;
      height: 58px;
      border: 0;
      border-radius: 50%;
      color: #fff;
      background: #007aff;
      box-shadow: 0 8px 18px rgba(0, 122, 255, 0.28);
      font-size: 34px;
      font-weight: 300;
      line-height: 1;
      cursor: pointer;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .add-button:hover { background: #006fe6; transform: translateY(-2px); }
    .add-button:active { transform: scale(0.94); }

    @media (max-width: 480px) {
      .top-bar { padding: 20px 16px 16px; }
      .contact-content { padding: 18px 16px; }
      .contact-item { margin-left: 14px; padding-right: 14px; }
      .contact-avatar { width: 44px; height: 44px; flex-basis: 44px; margin-right: 11px; }
      .chevron { display: none; }
      .delete-button { padding: 7px; }
    }
      </style>
