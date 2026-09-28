import axios from "axios";

// axios 实例，统一配置
const request = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000
});

// ==================== 联系人与分组关联 ====================

// 把联系人加入某个分组
export function addContactToGroup(contactId, groupId) {
    return request.post(`/contacts/${contactId}/groups/${groupId}`)
}

// 把联系人移出某个分组
export function removeContactFromGroup(contactId, groupId) {
    return request.delete(`/contacts/${contactId}/groups/${groupId}`)
}

// 查询某个联系人属于哪些分组
export function getGroupsOfContact(contactId) {
    return request.get(`/contacts/${contactId}/groups`)
}

// 查询某个分组下有哪些联系人
export function getContactsOfGroup(groupId) {
    return request.get(`/groups/${groupId}/contacts`)
}
