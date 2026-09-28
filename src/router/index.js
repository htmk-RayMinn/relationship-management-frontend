import { createRouter, createWebHistory } from 'vue-router'
import ContactList from '../views/ContactList.vue'
import ContactDetail from '../views/ContactDetail.vue'
import ContactForm from '../views/ContactForm.vue'
import AccountList from '../views/AccountList.vue'
import GroupList from '../views/GroupList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'contactList',
      component: ContactList
    },
    {
      path: '/contact/add',
      name: 'contactAdd',
      component: ContactForm
    },
    {
      path: '/contact/:id/edit',
      name: 'contactEdit',
      component: ContactForm
    },
    {
      path: '/contact/:id',
      name: 'contactDetail',
      component: ContactDetail
    },
    {
      path: '/accounts',
      name: 'accountList',
      component: AccountList
    },
    {
      path: '/groups',
      name: 'groupList',
      component: GroupList
    }
  ]
})

export default router
