import axios from "axios";

//axios实例，统一配置
const request = axios.create(
    {
        baseURL:'http://localhost:8080/api',//后端地址
        timeout:5000//超时时间
    }
)

//查询所有联系人
export function getContactList(){
    return request.get('/contacts')
}

//根据ID查联系人
export function getContactById(id){
    return request.get(`/contacts/${id}`)
}

//模糊搜索联系人
export function searchContact(keyword){
    return request.get('/contacts/search',{params:{keyword}})
}

//新增联系人
export function addContact(data){
    return request.post('/contacts/',data)
}

//更新联系人
export function updateContact(id,data){
    return request.put(`/contacts/${id}`,data)
}

//删除联系人
export function deleteContact(id){
    return request.delete(`/contacts/${id}`)
}