import axios from "axios";

// axios 实例，统一配置
const request = axios.create({
    baseURL: 'http://localhost:8080/api',  // 后端地址
    timeout: 5000                           // 超时时间
});

// ==================== 账号相关接口 ====================

// 查询所有账号
export function getAccountList() {
    return request.get('/accounts')
}

// 根据ID查询单个账号
export function getAccountById(id) {
    return request.get(`/accounts/${id}`)
}

// 模糊搜索账号（搜平台名或账号内容）
export function searchAccount(keyword) {
    return request.get('/accounts/search', { params: { keyword } })
}

// 新增账号
export function addAccount(data) {
    return request.post('/accounts', data)
}

// 更新账号
export function updateAccount(id, data) {
    return request.put(`/accounts/${id}`, data)
}

// 删除账号
export function deleteAccount(id) {
    return request.delete(`/accounts/${id}`)
}

// 查询某个联系人的所有账号
export function getAccountsOfContact(contactId) {
    return request.get(`/contacts/${contactId}/accounts`)
}
