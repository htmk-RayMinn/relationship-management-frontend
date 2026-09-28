import axios from "axios";

// axios 实例，统一配置
const request = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000
});

// ==================== 分组相关接口 ====================

// 查询所有分组
export function getGroupList() {
    return request.get('/groups')
}

// 根据ID查询单个分组
export function getGroupById(id) {
    return request.get(`/groups/${id}`)
}

// 新增分组
export function addGroup(data) {
    return request.post('/groups', data)
}

// 更新分组
export function updateGroup(id, data) {
    return request.put(`/groups/${id}`, data)
}

// 删除分组
export function deleteGroup(id) {
    return request.delete(`/groups/${id}`)
}
