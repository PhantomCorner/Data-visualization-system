<template>
    <div class="inputBox">
        <v-form-render :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef">
        </v-form-render>
        <el-button type="primary" @click="submitForm">Login</el-button>
    </div>
     
</template>
<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formJson = reactive({ "widgetList": [{ "key": 48501, "type": "input", "icon": "text-field", "formItemFlag": true, "options": { "name": "Username", "label": "Username", "labelAlign": "", "type": "text", "defaultValue": "", "placeholder": "", "columnWidth": "200px", "size": "small", "labelWidth": null, "labelHidden": false, "readonly": false, "disabled": false, "hidden": false, "clearable": true, "showPassword": false, "required": false, "requiredHint": "", "validation": "noChinese", "validationHint": "Please input valid username", "customClass": [], "labelIconClass": null, "labelIconPosition": "rear", "labelTooltip": null, "minLength": null, "maxLength": null, "showWordLimit": false, "prefixIcon": "", "suffixIcon": "", "appendButton": false, "appendButtonDisabled": false, "buttonIcon": "custom-search", "onCreated": "", "onMounted": "", "onInput": "", "onChange": "", "onFocus": "", "onBlur": "", "onValidate": "", "onAppendButtonClick": "" }, "id": "input98529" }, { "key": 48501, "type": "input", "icon": "text-field", "formItemFlag": true, "options": { "name": "Password", "label": "Password", "labelAlign": "", "type": "password", "defaultValue": "", "placeholder": "", "columnWidth": "200px", "size": "small", "labelWidth": "", "labelHidden": false, "readonly": false, "disabled": false, "hidden": false, "clearable": true, "showPassword": true, "required": false, "requiredHint": "", "validation": "", "validationHint": "", "customClass": "", "labelIconClass": null, "labelIconPosition": "rear", "labelTooltip": null, "minLength": null, "maxLength": null, "showWordLimit": false, "prefixIcon": "", "suffixIcon": "", "appendButton": false, "appendButtonDisabled": false, "buttonIcon": "custom-search", "onCreated": "", "onMounted": "", "onInput": "", "onChange": "", "onFocus": "", "onBlur": "", "onValidate": "", "onAppendButtonClick": "" }, "id": "input48751" }], "formConfig": { "modelName": "formData", "refName": "vForm", "rulesName": "rules", "labelWidth": 80, "labelPosition": "left", "size": "", "labelAlign": "label-left-align", "cssCode": "", "customClass": [], "functions": "", "layoutType": "PC", "jsonVersion": 3, "onFormCreated": "", "onFormMounted": "", "onFormDataChange": "" } })
const formData = reactive({})
const optionData = reactive({})
const vFormRef = ref(null)

const submitForm = () => {
    vFormRef.value.getFormData().then(formData => {
        // Form Validation OK
        alert(JSON.stringify(formData))
    }).catch(error => {
        // Form Validation failed
        ElMessage.error(error)
    })
}

</script>