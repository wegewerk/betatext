# Scripts und CSS einbinden, wenn korrekter Seitentyp
[globalVar = TSFE:page|doktype = 124]
config.doctype = <!DOCTYPE html>
page.meta{
    copyright = 
    page-topic = 
    date = 
    date.field = 
    date.date = 
}

page.includeJS.underscore = EXT:ww_bbt/lib/underscore-1.3.1.js
page.includeJS.backbone   = EXT:ww_bbt/lib/backbone.js
page.includeJS.rangy_core = EXT:ww_bbt/lib/rangy/rangy-core.js
page.includeJS.rangy_css  = EXT:ww_bbt/lib/rangy/rangy-cssclassapplier.js
page.includeJS.rangy_text = EXT:ww_bbt/lib/rangy/rangy-textrange.js

page.includeCSS.bbt = fileadmin/templates/css/bbt.css
page.includeCSS.mQCSS = 
page.includeCSS.mobile_navCSS =

# eigenes Template
page.100.marks.SUB_CONTENT.template.file >
page.100.marks.SUB_CONTENT.template.file = EXT:ww_bbt/template/bbt.html

page.headerData.4711 = TEXT
page.headerData.4711.value = {path:EXT:ww_bbt/lib/require.js}
page.headerData.4711.insertData = 1
page.headerData.4711.wrap = <script type="text/javascript" data-main="/typo3conf/ext/ww_bbt/app/main.js" src="|"></script>

page.headerData.4710 = TEXT
page.headerData.4710.value = var pageUID = {page:uid};
page.headerData.4710.insertData = 1
page.headerData.4710.wrap = <script type="text/javascript">|</script>
[global]


# wenn Tool aktiviert, dann auch noch Klasse im BODY
[globalVar = TSFE:page|tx_wwbbt_enable = 1]
page.bodyTag >

page.bodyTagCObject = TEXT
page.bodyTagCObject.value= nothasjs bbt_enabled
page.bodyTagCObject.wrap = <body class="|">
[global]