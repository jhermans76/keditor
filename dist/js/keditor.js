/**!
 * KEditor - Kademi content editor
 * @copyright: Kademi (http://kademi.co)
 * @author: Kademi (http://kademi.co)
 * @version: 2.0.0
 * @dependencies: $, $.fn.sortable, Bootstrap (optional), FontAwesome (optional)
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window, $) {
    // Log function will print log message
    var flog = function flog() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (console && typeof console.log === 'function' && KEditor.debug === true) {
            console.log.apply(console, ['[ KEditor ] '].concat(args));
        }
    };

    // Throw error message
    var error = function error(message) {
        throw new Error('[ KEditor ] ' + message);
    };

    // Check dependencies
    if (!$.fn.sortable) {
        error('$.fn.sortable does not exist. Please import $.fn.sortable into your document for continue using KEditor.');
    }

    var DEFAULTS = {
        nestedContainerEnabled: true,
        btnAddContainerText: '<i class="fa fa-plus"></i> <i class="fa fa-fw fa-columns"></i>',
        btnAddSubContainerText: '<i class="fa fa-plus"></i> <i class="fa fa-fw fa-columns"></i>',
        btnAddComponentText: '<i class="fa fa-plus"></i> <i class="fa fa-fw fa-list-ul"></i>',
        btnMoveContainerText: '<i class="fa fa-sort"></i>',
        btnMoveComponentText: '<i class="fa fa-arrows"></i>',
        btnSettingContainerText: '<i class="fa fa-cog"></i>',
        btnSettingComponentText: '<i class="fa fa-cog"></i>',
        btnDuplicateContainerText: '<i class="fa fa-files-o"></i>',
        btnDuplicateComponentText: '<i class="fa fa-files-o"></i>',
        btnDeleteContainerText: '<i class="fa fa-times"></i>',
        btnDeleteComponentText: '<i class="fa fa-times"></i>',
        defaultComponentType: 'blank',
        snippetsUrl: 'snippets/snippets.html',
        snippetsFilterEnabled: true,
        snippetsCategoriesSeparator: ';',
        iframeMode: false,
        contentStyles: [],
        contentAreasSelector: null,
        contentAreasWrapper: '<div class="keditor-ui keditor-content-areas-wrapper"></div>',
        containerSettingEnabled: false,
        containerSettingInitFunction: null,
        containerSettingShowFunction: null,
        containerSettingHideFunction: null,
        onReady: function onReady() {},

        onSnippetsLoaded: function onSnippetsLoaded(modal) {},
        onSnippetsError: function onSnippetsError(modal, error) {},

        onInitIframe: function onInitIframe(iframe, iframeHead, iframeBody) {},
        onContentChanged: function onContentChanged(event, contentArea) {},

        onBeforeInitContentArea: function onBeforeInitContentArea(contentArea) {},
        onInitContentArea: function onInitContentArea(contentArea) {},

        onBeforeInitContainer: function onBeforeInitContainer(container, contentArea) {},
        onInitContainer: function onInitContainer(container, contentArea) {},
        onBeforeContainerDeleted: function onBeforeContainerDeleted(event, selectedContainer, contentArea) {},
        onContainerDeleted: function onContainerDeleted(event, selectedContainer, contentArea) {},
        onContainerChanged: function onContainerChanged(event, changedContainer, contentArea) {},
        onContainerDuplicated: function onContainerDuplicated(event, originalContainer, newContainer, contentArea) {},
        onContainerSelected: function onContainerSelected(event, selectedContainer, contentArea) {},
        onContainerSnippetAdded: function onContainerSnippetAdded(event, newContainer, selectedSnippet, contentArea) {},

        onComponentReady: function onComponentReady(component) {},
        onBeforeInitComponent: function onBeforeInitComponent(component, contentArea) {},
        onInitComponent: function onInitComponent(component, contentArea) {},
        onBeforeComponentDeleted: function onBeforeComponentDeleted(event, selectedComponent, contentArea) {},
        onComponentDeleted: function onComponentDeleted(event, selectedComponent, contentArea) {},
        onComponentChanged: function onComponentChanged(event, changedComponent, contentArea) {},
        onComponentDuplicated: function onComponentDuplicated(event, originalComponent, newComponent, contentArea) {},
        onComponentSelected: function onComponentSelected(event, selectedComponent, contentArea) {},
        onComponentSnippetAdded: function onComponentSnippetAdded(event, newComponent, selectedSnippet, contentArea) {},

        onBeforeDynamicContentLoad: function onBeforeDynamicContentLoad(dynamicElement, component, contentArea) {},
        onDynamicContentLoaded: function onDynamicContentLoaded(dynamicElement, response, status, xhr, contentArea) {},
        onDynamicContentError: function onDynamicContentError(dynamicElement, response, status, xhr, contentArea) {}
    };

    var MODAL_ACTION = {
        ADD_CONTAINER: 0,
        ADD_SUB_CONTAINER: 1,
        ADD_COMPONENT: 2
    };

    var TOOLBAR_TYPE = {
        CONTENT_AREA: 0,
        CONTAINER: 1,
        SUB_CONTAINER: 2,
        CONTAINER_CONTENT: 3,
        SUB_CONTAINER_CONTENT: 4,
        COMPONENT: 5
    };

    // KEditor class

    var KEditor = function () {
        function KEditor(target, config) {
            _classCallCheck(this, KEditor);

            var self = this;
            var element = self.element = target;
            var options = self.options = $.extend({}, DEFAULTS, config);

            if (options.iframeMode) {
                self.initIframe();
            } else {
                self.window = window;
                self.body = $(document.body);

                var originalContent = element.val() || element.html() || '';
                var contentAreasWrapper = self.generateContentAreasWrapper(originalContent);

                if (element.is('textarea')) {
                    element.after(contentAreasWrapper);
                    element.addClass('keditor-hidden-element');
                } else {
                    element.empty().append(contentAreasWrapper);
                }

                self.contentAreasWrapper = contentAreasWrapper;
            }

            self.initSidebar();
            self.initSnippetsModal();
            self.initContentAreas();

            if (!self.body.hasClass('keditor-clicks-initialized')) {
                self.initKEditorClicks();
            }

            self.id = self.generateId();
            KEditor.instances[self.id] = self;

            if (typeof options.onReady === 'function') {
                options.onReady.call(self);
            }
        }

        // Utils
        //---------------------------------


        _createClass(KEditor, [{
            key: 'generateId',
            value: function generateId() {
                var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

                var timestamp = new Date().getTime();
                var random = Math.round(Math.random() * 9876543210);
                return 'keditor-' + type + '-' + timestamp + random;
            }
        }, {
            key: 'generateContentAreasWrapper',
            value: function generateContentAreasWrapper(content) {
                var self = this;
                var options = self.options;

                var contentAreasWrapper = $(options.contentAreasWrapper || '<div />');
                contentAreasWrapper.attr('class', 'keditor-ui keditor-content-area-wrapper');

                if (!contentAreasWrapper.attr('id')) {
                    contentAreasWrapper.attr('id', self.generateId('content-area-wrapper'));
                }

                contentAreasWrapper.html(content);

                return contentAreasWrapper;
            }
        }, {
            key: 'generateToolbar',
            value: function generateToolbar(type, isComponentConfigurable) {
                var self = this;
                var options = self.options;
                var settingBtn = '';

                switch (type) {
                    case TOOLBAR_TYPE.CONTENT_AREA:
                        return '                    \n                        <div class="keditor-ui keditor-content-area-toolbar">\n                            <a href="javascript:void(0)" class="keditor-ui keditor-btn keditor-btn-default btn-add-container" title="Add container">' + options.btnAddContainerText + '</a>\n                        </div>\n                    ';

                    case TOOLBAR_TYPE.CONTAINER:
                        if (options.containerSettingEnabled === true) {
                            settingBtn = '<a href="javascript:void(0);" class="keditor-ui btn-container-setting">' + options.btnSettingContainerText + '</a>';
                        }

                        return '\n                        <div class="keditor-toolbar keditor-toolbar-container">\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-reposition">' + options.btnMoveContainerText + '</a>\n                            ' + settingBtn + '\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-duplicate">' + options.btnDuplicateContainerText + '</a>\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-delete">' + options.btnDeleteContainerText + '</a>\n                        </div>\n                    ';

                    case TOOLBAR_TYPE.SUB_CONTAINER:
                        if (options.containerSettingEnabled === true) {
                            settingBtn = '<a href="javascript:void(0);" class="keditor-ui btn-container-setting">' + options.btnSettingContainerText + '</a>';
                        }

                        return '\n                        <div class="keditor-toolbar keditor-toolbar-container keditor-toolbar-sub-container">\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-reposition">' + options.btnMoveContainerText + '</a>\n                            ' + settingBtn + '\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-duplicate">' + options.btnDuplicateContainerText + '</a>\n                            <a href="javascript:void(0);" class="keditor-ui btn-container-delete">' + options.btnDeleteContainerText + '</a>\n                        </div>\n                    ';

                    case TOOLBAR_TYPE.CONTAINER_CONTENT:
                        return '          \n                        <div class="keditor-ui keditor-container-content-toolbar keditor-btn-group">\n                            <a href="javascript:void(0)" class="keditor-ui keditor-btn keditor-btn-default btn-add-container" title="Add sub-container">' + options.btnAddSubContainerText + '</a>\n                            <a href="javascript:void(0)" class="keditor-ui keditor-btn keditor-btn-default btn-add-component" title="Add component">' + options.btnAddComponentText + '</a>\n                        </div>\n                    ';

                    case TOOLBAR_TYPE.SUB_CONTAINER_CONTENT:
                        return '\n                        <div class="keditor-ui keditor-container-content-toolbar">\n                            <a href="javascript:void(0)" class="keditor-ui keditor-btn keditor-btn-default btn-add-component" title="Add component">' + options.btnAddComponentText + '</a>\n                        </div>\n                    ';

                    case TOOLBAR_TYPE.COMPONENT:
                        if (isComponentConfigurable) {
                            settingBtn = '<a href="javascript:void(0);" class="keditor-ui btn-component-setting">' + options.btnSettingComponentText + '</a>';
                        }

                        return '\n                        <div class="keditor-toolbar keditor-toolbar-component">\n                            <a href="javascript:void(0);" class="keditor-ui btn-component-reposition">' + options.btnMoveComponentText + '</a>\n                            ' + settingBtn + '\n                            <a href="javascript:void(0);" class="keditor-ui btn-component-duplicate">' + options.btnDuplicateComponentText + '</a>\n                            <a href="javascript:void(0);" class="keditor-ui btn-component-delete">' + options.btnDeleteComponentText + '</a>\n                        </div>\n                    ';

                    default:
                    // Do nothing
                }
            }
        }, {
            key: 'beautifyCategories',
            value: function beautifyCategories(categories) {
                var newArray = [];
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i] || '';

                    if (category !== '' && $.inArray(category, newArray) === -1) {
                        newArray.push(category);
                    }
                }

                return newArray.sort();
            }
        }, {
            key: 'setSettingContainer',
            value: function setSettingContainer(container) {
                this.settingContainer = container;
            }
        }, {
            key: 'getSettingContainer',
            value: function getSettingContainer() {
                return this.settingContainer;
            }
        }, {
            key: 'setSettingComponent',
            value: function setSettingComponent(component) {
                this.settingComponent = component;
            }
        }, {
            key: 'getSettingComponent',
            value: function getSettingComponent() {
                return this.settingComponent;
            }
        }, {
            key: 'getDataAttributes',
            value: function getDataAttributes(target, ignoreAttributes, isArray) {
                var dataAttributes = isArray ? [] : {};
                if (!ignoreAttributes) {
                    ignoreAttributes = [];
                }

                $.each(target.get(0).attributes, function (i, attr) {
                    if (attr.name.indexOf('data-') === 0 && $.inArray(attr.name, ignoreAttributes) === -1) {
                        if (isArray) {
                            dataAttributes.push(attr.name + '="' + attr.value + '"');
                        } else {
                            dataAttributes[attr.name] = attr.value;
                        }
                    }
                });

                return dataAttributes;
            }
        }, {
            key: 'getComponentType',
            value: function getComponentType(component) {
                var self = this;
                var options = self.options;

                var componentType = (component.attr('data-type') || '').replace('component-', '');
                if (componentType && componentType in KEditor.components) {
                    return componentType;
                } else {
                    if (typeof options.defaultComponentType === 'string') {
                        componentType = options.defaultComponentType;
                    } else if (typeof options.defaultComponentType === 'function') {
                        componentType = options.defaultComponentType.call(self, component);
                    }

                    if (!componentType) {
                        error('Component type is undefined!');
                    }

                    flog('Fallback to defaultComponentType: ' + componentType);
                    return componentType;
                }
            }
        }, {
            key: 'getClickedElement',
            value: function getClickedElement(event, selector) {
                var target = $(event.target);
                var closest = target.closest(selector);

                if (target.is(selector)) {
                    return target;
                } else if (closest.length > 0) {
                    return closest;
                } else {
                    return null;
                }
            }

            // Iframe
            //---------------------------------

        }, {
            key: 'initIframe',
            value: function initIframe() {
                flog('initIframe');

                var self = this;
                var options = self.options;
                var element = self.element;
                var originalContent = element.is('textarea') ? element.val() : element.html();
                var wrapper = self.iframeWrapper = $('<div class="keditor-ui keditor-iframe-wrapper"></div>');
                var iframe = self.iframe = $('<iframe class="keditor-ui keditor-iframe"></iframe>');

                element.after(wrapper);
                wrapper.attr('id', self.generateId('iframe-wrapper')).append(iframe);
                element.addClass('keditor-hidden-element');

                var iframeDoc = self.iframeDoc = iframe.contents();

                // Fix issue Firefox can't render content inside iframe
                // ======================================================
                iframeDoc.get(0).open();
                iframeDoc.get(0).close();
                // ======================================================

                self.window = iframe[0].contentWindow ? iframe[0].contentWindow : iframe[0].contentDocument.defaultView;
                var iframeHead = self.iframeHead = iframeDoc.find('head');
                var iframeBody = self.iframeBody = self.body = iframeDoc.find('body');

                flog('Adding styles to iframe...');
                var styles = '';
                $('[data-type="keditor-style"]').each(function () {
                    var style = $(this);
                    var href = style.attr('href') || style.attr('data-href') || '';

                    if (href) {
                        styles += '<link rel="stylesheet" type="text/css" href="' + href + '" />\n';
                    } else {
                        styles += '<style type="text/css">' + style.html() + '</style>\n';
                    }
                });

                if (options.contentStyles && $.isArray(options.contentStyles)) {
                    $.each(options.contentStyles, function (i, style) {
                        var idStr = '';
                        if (style.id) {
                            idStr = ' id="' + style.id + '" ';
                        }

                        if (style.href) {
                            styles += '<link rel="stylesheet" type="text/css" href="' + style.href + '" ' + idStr + ' />\n';
                        } else {
                            styles += '<style type="text/css" ' + idStr + '>' + style.content + '</style>\n';
                        }
                    });
                }

                iframeHead.append(styles);

                flog('Adding original content to iframe...');
                var contentAreasWrapper = self.generateContentAreasWrapper(originalContent);
                iframeBody.append(contentAreasWrapper);
                self.contentAreasWrapper = contentAreasWrapper;

                if (typeof options.onInitIframe === 'function') {
                    options.onInitIframe.call(self, iframe, iframeHead, iframeBody);
                }
            }

            // KEditor clicks
            //---------------------------------

        }, {
            key: 'initKEditorClicks',
            value: function initKEditorClicks() {
                flog('initKEditorClicks');

                var self = this;
                var options = self.options;
                var body = self.body;

                body.on('click', function (e) {
                    var sidebar = self.getClickedElement(e, '#keditor-sidebar');

                    var container = self.getClickedElement(e, '.keditor-container');
                    if (container) {
                        if (!container.hasClass('showed-keditor-toolbar')) {
                            body.find('.keditor-container.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                            body.find('.keditor-component.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                            container.addClass('showed-keditor-toolbar');

                            var contentArea = container.parent();
                            if (typeof options.onContainerSelected === 'function') {
                                options.onContainerSelected.call(self, e, container, contentArea);
                            }
                        }
                    } else {
                        if (!sidebar) {
                            body.find('.keditor-container.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                            body.find('.keditor-component.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                        }
                    }

                    var component = self.getClickedElement(e, '.keditor-component');
                    if (component) {
                        if (!component.hasClass('showed-keditor-toolbar')) {
                            body.find('.keditor-component.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                            component.addClass('showed-keditor-toolbar');

                            var _contentArea = component.parent();
                            if (typeof options.onComponentSelected === 'function') {
                                options.onComponentSelected.call(self, e, component, _contentArea);
                            }
                        }
                    } else {
                        if (!sidebar) {
                            body.find('.keditor-component.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                        }
                    }
                });

                body.on('click', '.btn-container-setting', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-container-setting', btn);

                    var container = btn.closest('.keditor-container');
                    if (body.hasClass('opened-keditor-setting') && body.hasClass('opened-keditor-sidebar')) {
                        if (!container.is(self.settingContainer)) {
                            self.openSidebar(container);
                        } else {
                            self.closeSidebar();
                        }
                    } else {
                        self.openSidebar(container);
                    }
                });

                body.on('click', '.btn-container-duplicate', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-container-duplicate', btn);

                    var container = btn.closest('.keditor-container');
                    var contentArea = container.parent();
                    var newContainer = $(self.getContainerContent(container, btn.parent().hasClass('keditor-toolbar-sub-container')));
                    container.after(newContainer);
                    self.convertToContainer(contentArea, newContainer);

                    flog('Container is duplicated');

                    if (typeof options.onContainerDuplicated === 'function') {
                        options.onContainerDuplicated.call(self, container, newContainer, contentArea);
                    }

                    if (typeof options.onContentChanged === 'function') {
                        options.onContentChanged.call(self, e, contentArea);
                    }
                });

                body.on('click', '.btn-container-delete', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-container-delete', btn);

                    if (confirm('Are you sure that you want to delete this container? This action can not be undo!')) {
                        var container = btn.closest('.keditor-container');
                        var components = container.find('.keditor-component');
                        var contentArea = container.parent();

                        if (typeof options.onBeforeContainerDeleted === 'function') {
                            options.onBeforeContainerDeleted.call(self, e, container, contentArea);
                        }

                        var settingComponent = self.settingComponent;
                        if (settingComponent) {
                            var settingComponentParent = settingComponent.closest('.keditor-container');
                            if (settingComponentParent.is(container)) {
                                flog('Deleting container is container of setting container. Close setting panel for this setting component', settingComponent);
                                self.closeSidebar();
                            }
                        } else if (container.is(self.settingContainer)) {
                            flog('Deleting container is setting container. Close setting panel for this container', container);
                            self.closeSidebar();
                        }

                        if (components.length > 0) {
                            components.each(function () {
                                self.deleteComponent($(this));
                            });
                        }

                        container.remove();

                        if (typeof options.onContainerDeleted === 'function') {
                            options.onContainerDeleted.call(self, e, container, contentArea);
                        }

                        if (typeof options.onContentChanged === 'function') {
                            options.onContentChanged.call(self, e, contentArea);
                        }
                    }
                });

                body.on('click', '.btn-component-setting', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-component-setting', btn);

                    var component = btn.closest('.keditor-component');
                    if (body.hasClass('opened-keditor-setting') && body.hasClass('opened-keditor-sidebar')) {
                        if (!component.is(self.settingComponent())) {
                            self.openSidebar(component);
                        } else {
                            self.closeSidebar();
                        }
                    } else {
                        self.openSidebar(component);
                    }
                });

                body.on('click', '.btn-component-duplicate', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-component-duplicate', btn);

                    var component = btn.closest('.keditor-component');
                    var container = component.closest('.keditor-container');
                    var contentArea = container.parent();
                    var newComponent = $(self.getComponentContent(component));

                    component.after(newComponent);
                    self.convertToComponent(contentArea, container, newComponent);

                    flog('Component is duplicated');

                    if (typeof options.onComponentDuplicated === 'function') {
                        options.onComponentDuplicated.call(self, component, newComponent, contentArea);
                    }

                    if (typeof options.onContainerChanged === 'function') {
                        options.onContainerChanged.call(self, e, container, contentArea);
                    }

                    if (typeof options.onContentChanged === 'function') {
                        options.onContentChanged.call(self, e, contentArea);
                    }
                });

                body.on('click', '.btn-component-delete', function (e) {
                    e.preventDefault();

                    var btn = $(this);
                    flog('Click on .btn-component-delete', btn);

                    if (confirm('Are you sure that you want to delete this component? This action can not be undo!')) {
                        var component = btn.closest('.keditor-component');
                        var container = component.closest('.keditor-container');
                        var contentArea = component.closest('.keditor-content-area');

                        if (typeof options.onBeforeComponentDeleted === 'function') {
                            options.onBeforeComponentDeleted.call(self, e, component, contentArea);
                        }

                        if (component.is(self.settingComponent)) {
                            self.closeSidebar();
                        }

                        self.deleteComponent(component);

                        if (typeof options.onComponentDeleted === 'function') {
                            options.onComponentDeleted.call(self, e, component, contentArea);
                        }

                        if (typeof options.onContainerChanged === 'function') {
                            options.onContainerChanged.call(self, e, container, contentArea);
                        }

                        if (typeof options.onContentChanged === 'function') {
                            options.onContentChanged.call(self, e, contentArea);
                        }
                    }
                });

                body.addClass('keditor-clicks-initialized');
            }

            // Sidebar
            //---------------------------------

        }, {
            key: 'initSidebar',
            value: function initSidebar() {
                var self = this;
                var options = self.options;
                var sidebarId = self.generateId('sidebar');

                var sidebar = self.sidebar = $('\n                <div class="keditor-ui keditor-sidebar" id="' + sidebarId + '">                    \n                    <div class="keditor-ui keditor-sidebar-header">\n                        <span class="keditor-ui keditor-sidebar-title"></span>\n                        <a href="javascript:void(0);" class="keditor-ui keditor-sidebar-close">&times;</a>\n                    </div>\n                    <div class="keditor-ui keditor-sidebar-body">\n                        \n                    </div>\n                </div>\n            ');

                sidebar.find('.keditor-sidebar-close').on('click', function (e) {
                    e.preventDefault();

                    self.closeSidebar();
                });

                var sidebarBody = sidebar.find('.keditor-sidebar-body');
                sidebarBody.on('submit', 'form', function (e) {
                    e.preventDefault();
                    return false;
                });

                if (options.containerSettingEnabled === true) {
                    if (typeof options.containerSettingInitFunction === 'function') {

                        var form = $('<div  class="keditor-ui keditor-setting-form keditor-container-setting"></div>');
                        sidebarBody.append(form);

                        flog('Initialize container setting panel');
                        options.containerSettingInitFunction.call(self, form, self);
                    } else {
                        error('"containerSettingInitFunction" is not function!');
                    }
                }

                sidebar.appendTo(options.iframeMode ? self.iframeWrapper : self.body);
            }
        }, {
            key: 'openSidebar',
            value: function openSidebar(target) {
                var self = this;
                var options = self.options;
                var sidebar = self.sidebar;
                var sidebarTitle = sidebar.find('.keditor-sidebar-title');
                var sidebarBody = sidebar.find('.keditor-sidebar-body');
                var activeForm = sidebarBody.children('.active');
                activeForm.removeClass('active');

                if (target.is('.keditor-component')) {
                    self.setSettingComponent(target);
                    self.setSettingContainer(null);

                    var componentType = self.getComponentType(target);
                    var componentData = KEditor.components[componentType];
                    sidebarTitle.html(componentData.settingTitle);

                    var settingForm = sidebarBody.find('.keditor-setting-' + componentType);

                    if (settingForm.length === 0) {
                        var _componentData = KEditor.components[componentType];
                        if (typeof _componentData.initSettingForm === 'function') {
                            settingForm = $('\n                            <div \n                                data-type="' + componentType + '" \n                                class="keditor-ui keditor-setting-form keditor-setting-' + componentType + ' clearfix active"\n                            >\n                            </div>\n                        ');
                            var loadingText = $('<span />').html('Loading...');
                            sidebarBody.append(settingForm);
                            settingForm.append(loadingText);

                            var initFunction = _componentData.initSettingForm.call(_componentData, settingForm, self);
                            $.when(initFunction).done(function () {
                                flog('Initialized setting form for component type "' + componentType + '"');

                                setTimeout(function () {
                                    loadingText.remove();

                                    if (typeof _componentData.showSettingForm === 'function') {
                                        _componentData.showSettingForm.call(_componentData, settingForm, target, self);
                                    }
                                }, 100);
                            });
                        }
                    } else {
                        if (typeof componentData.showSettingForm === 'function') {
                            componentData.showSettingForm.call(componentData, settingForm, target, self);
                        }
                        settingForm.addClass('active');
                    }
                } else {
                    self.setSettingContainer(target);
                    self.setSettingComponent(null);

                    sidebarTitle.html("Container Settings");

                    var _settingForm = sidebar.find('.keditor-container-setting');
                    if (typeof options.containerSettingShowFunction === 'function') {
                        options.containerSettingShowFunction.call(self, _settingForm, target, self);
                    }
                    _settingForm.addClass('active');
                }

                sidebar.addClass('opened');
            }
        }, {
            key: 'closeSidebar',
            value: function closeSidebar() {
                var self = this;
                var options = self.options;
                var sidebar = self.sidebar;
                var activeForm = sidebar.find('.keditor-sidebar-body').children('.active');

                if (activeForm.length > 0) {
                    if (activeForm.is('.keditor-container-setting')) {
                        if (typeof options.containerSettingHideFunction === 'function') {
                            options.containerSettingHideFunction.call(self, activeForm, self);
                        }
                    } else {
                        var activeType = activeForm.attr('data-type');
                        var componentData = KEditor.components[activeType];

                        if (typeof componentData.hideSettingForm === 'function') {
                            componentData.hideSettingForm.call(componentData, activeForm, self);
                        }
                    }

                    activeForm.removeClass('active');
                }

                self.setSettingComponent(null);
                self.setSettingContainer(null);
                sidebar.removeClass('opened');
            }

            // Legacy methods. DEPRECATED
            //---------------------------------

        }, {
            key: 'showSettingPanel',
            value: function showSettingPanel(target) {
                this.openSidebar(target);
            }
        }, {
            key: 'hideSettingPanel',
            value: function hideSettingPanel() {
                this.closeSidebar();
            }

            // Snippet modal
            //---------------------------------

        }, {
            key: 'initSnippetsModal',
            value: function initSnippetsModal() {
                var self = this;
                var options = self.options;
                var modalId = self.generateId('modal');

                var modal = self.modal = $('\n                <div class="keditor-ui keditor-modal" id="' + modalId + '">\n                   <div class="keditor-modal-header">\n                       <button type="button" class="keditor-modal-close">&times;</button>\n                       <h4 class="keditor-modal-title"></h4>\n                   </div>\n                   <div class="keditor-modal-body">\n                       <div class="keditor-snippets-wrapper keditor-snippets-wrapper-container">\n                           <div class="keditor-snippets keditor-snippet-container"></div>\n                       </div>\n                       <div class="keditor-snippets-wrapper keditor-snippets-wrapper-component">\n                           <div class="keditor-snippets keditor-snippet-component"></div>\n                       </div>\n                   </div>\n                   <div class="keditor-modal-footer">\n                       <button type="button" class="keditor-ui keditor-btn keditor-btn-default keditor-modal-close">Close</button>\n                       <button type="button" class="keditor-ui keditor-btn keditor-btn-primary keditor-modal-add">Add</button>\n                   </div>\n                </div>\n            ');

                if (typeof options.snippetsUrl === 'string' && options.snippetsUrl.length > 0) {
                    flog('Getting snippets form "' + options.snippetsUrl + '"...');

                    $.ajax({
                        type: 'get',
                        dataType: 'html',
                        url: options.snippetsUrl,
                        success: function success(resp) {
                            flog('Success in getting snippets');

                            if (typeof options.onSnippetsLoaded === 'function') {
                                resp = options.onSnippetsLoaded.call(self, resp) || resp;
                            }

                            self.renderSnippets(resp);

                            if (options.snippetsFilterEnabled) {
                                self.initSnippetsFilter(true);
                                self.initSnippetsFilter();
                            }
                        },
                        error: function error(jqXHR) {
                            flog('Error when getting snippets', jqXHR);
                            if (typeof options.onSnippetsError === 'function') {
                                options.onSnippetsError.call(self, jqXHR);
                            }
                        }
                    });

                    // Close buttons
                    modal.find('.keditor-modal-close').on('click', function (e) {
                        e.preventDefault();

                        self.closeModal();
                    });

                    // Add button
                    modal.find('.keditor-modal-add').on('click', function (e) {
                        e.preventDefault();

                        var selectedSnippet = modal.find('.keditor-snippets-wrapper .selected');
                        if (selectedSnippet.length === 0) {
                            return;
                        }

                        var contentArea = self.modalTarget.closest('.keditor-content-area');
                        var snippetType = selectedSnippet.attr('data-type');
                        var snippetContentElement = modal.find(selectedSnippet.attr('data-snippet'));
                        var snippetContent = snippetContentElement.html();

                        switch (self.modalAction) {
                            case MODAL_ACTION.ADD_COMPONENT:
                                var dataAttributes = self.getDataAttributes(snippetContentElement, null, true);
                                var newComponent = $('\n                                <section class="keditor-ui keditor-component" data-type="' + snippetType + '" ' + dataAttributes.join(' ') + '>\n                                    <section class="keditor-ui keditor-component-content">' + snippetContent + '</section>\n                                </section>\n                            ');

                                self.modalTarget.append(newComponent);

                                var container = self.modalTarget.closest('.keditor-container');
                                if (typeof options.onComponentSnippetAdded === 'function') {
                                    options.onComponentSnippetAdded.call(self, e, newComponent, selectedSnippet, contentArea);
                                }

                                self.initComponent(contentArea, container, newComponent);
                                break;

                            case MODAL_ACTION.ADD_CONTAINER:
                            case MODAL_ACTION.ADD_SUB_CONTAINER:
                                var newContainer = $('\n                                <section class="keditor-ui keditor-container showed-keditor-toolbar">\n                                    <section class="keditor-ui keditor-container-inner">' + snippetContent + '</section>\n                                </section>\n                            ');

                                self.body.find('.keditor-container.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                                self.modalTarget.append(newContainer);

                                if (typeof options.onContainerSnippetAdded === 'function') {
                                    options.onContainerSnippetAdded.call(self, event, newContainer, selectedSnippet, contentArea);
                                }

                                self.initContainer(contentArea, newContainer);
                                break;

                            default:
                            // Do nothing
                        }

                        self.closeModal();
                    });

                    // Action click for snippet
                    modal.on('click', '.keditor-snippet', function (e) {
                        e.preventDefault();

                        var snippet = $(this);
                        if (!snippet.hasClass('selected')) {
                            snippet.parent().find('.selected').removeClass('selected');
                            snippet.addClass('selected');
                        }
                    });

                    var cssTransitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
                    modal.on(cssTransitionEnd, function () {
                        if (!modal.hasClass('showed')) {
                            modal.css('display', 'none');
                            $(document.body).removeClass('opened-modal');
                        }
                    });

                    modal.appendTo(document.body);
                } else {
                    error('"snippetsUrl" must be not null!');
                }
            }
        }, {
            key: 'renderSnippets',
            value: function renderSnippets(resp) {
                flog('renderSnippets');

                var self = this;
                var options = self.options;

                var snippetsContainerHtml = '';
                var snippetsComponentHtml = '';
                var snippetsContentHtml = '';

                self.snippetsContainerCategories = [];
                self.snippetsComponentCategories = [];

                $(resp).filter('div').each(function (i) {
                    var snippet = $(this);
                    var snippetId = self.generateId('snippet');
                    var content = snippet.html().trim();
                    var previewUrl = snippet.attr('data-preview');
                    var type = snippet.attr('data-type');
                    var title = snippet.attr('data-keditor-title');
                    var categories = snippet.attr('data-keditor-categories') || '';

                    var snippetHtml = '\n                    <section\n                        class="keditor-ui keditor-snippet"\n                        data-snippet="#' + snippetId + '"\n                        data-type="' + type + '"\n                        title="' + title + '"\n                        data-keditor-categories="' + categories + '"\n                    >\n                        <span><span style="background-image: url(\'' + previewUrl + '\')"></span></span>   \n                    </section>\n                ';

                    categories = categories.split(options.snippetsCategoriesSeparator);

                    if (type === 'container') {
                        snippetsContainerHtml += snippetHtml;
                        self.snippetsContainerCategories = self.snippetsContainerCategories.concat(categories);
                    } else if (type.indexOf('component') !== -1) {
                        snippetsComponentHtml += snippetHtml;
                        self.snippetsComponentCategories = self.snippetsComponentCategories.concat(categories);
                    }

                    var dataAttributes = self.getDataAttributes(snippet, ['data-preview', 'data-type', 'data-keditor-title', 'data-keditor-categories'], true);
                    snippetsContentHtml += '<script id="' + snippetId + '" type="text/html" ' + dataAttributes.join(' ') + '>' + content + '</script>';
                });

                self.snippetsContainerCategories = self.beautifyCategories(self.snippetsContainerCategories);
                self.snippetsComponentCategories = self.beautifyCategories(self.snippetsComponentCategories);

                self.modal.find('.keditor-snippet-container').html(snippetsContainerHtml);
                self.modal.find('.keditor-snippet-component').html(snippetsComponentHtml);
                self.modal.find('.keditor-modal-body').append(snippetsContentHtml);
            }
        }, {
            key: 'initSnippetsFilter',
            value: function initSnippetsFilter(isContainer) {
                flog('initSnippetsFilter for ' + (isContainer ? 'container' : 'component'));

                var self = this;
                var options = self.options;
                var modal = self.modal;

                var categoriesOptions = '';
                $.each(isContainer ? self.snippetsContainerCategories : self.snippetsComponentCategories, function (i, category) {
                    categoriesOptions += '<option value="' + category + '">' + category + '</option>';
                });

                var snippetsWrapper = modal.find(isContainer ? '.keditor-snippets-wrapper-container' : '.keditor-snippets-wrapper-component');
                var snippets = snippetsWrapper.find('.keditor-snippets').children('.keditor-snippet');

                snippetsWrapper.prepend('\n                <div class="keditor-ui keditor-snippets-filter-wrapper">\n                    <select class="keditor-ui keditor-snippets-filter">\n                        <option value="" selected="selected">All</option>\n                        ' + categoriesOptions + '\n                    </select>\n                    <input type="text" class="keditor-ui keditor-snippets-search" value="" placeholder="Type to search..." />\n                </div>                \n            ');

                snippets.each(function () {
                    var snippet = $(this);
                    var categories = snippet.attr('data-keditor-categories') || '';
                    var filterCategories = categories.toLowerCase();
                    categories = categories.split(options.snippetsCategoriesSeparator);
                    filterCategories = filterCategories.split(options.snippetsCategoriesSeparator);

                    snippet.data('categories', categories);
                    snippet.data('categoriesFilter', filterCategories);
                });

                var txtSearch = snippetsWrapper.find('.keditor-snippets-search');
                var cbbFilter = snippetsWrapper.find('.keditor-snippets-filter');

                var doFilter = function doFilter() {
                    var selectedCategory = (cbbFilter.val() || '').toLowerCase();
                    var searchText = (txtSearch.val() || '').toLowerCase();
                    snippets.filter('.selected').removeClass('selected');

                    if (selectedCategory || searchText) {
                        flog('Filtering snippets');

                        snippets.each(function () {
                            var snippet = $(this);
                            var dataCategories = snippet.data('categoriesFilter');
                            var dataCategoriesString = dataCategories.join(';');
                            var error = 0;

                            if (selectedCategory) {
                                if ($.inArray(selectedCategory, dataCategories) === -1) {
                                    error++;
                                }
                            }

                            if (searchText) {
                                var title = snippet.attr('title').toLowerCase();
                                if (title.indexOf(searchText) === -1 && dataCategoriesString.indexOf(searchText) === -1) {
                                    error++;
                                }
                            }

                            snippet[error === 0 ? 'removeClass' : 'addClass']('not-matched');
                        });
                    } else {
                        flog('Show all snippets');
                        snippets.removeClass('not-matched');
                    }
                };

                cbbFilter.on('change', function () {
                    doFilter();
                });

                var timer = void 0;
                txtSearch.on('keydown', function () {
                    clearTimeout(timer);
                    timer = setTimeout(doFilter, 200);
                });
            }
        }, {
            key: 'openModal',
            value: function openModal(target, action) {
                var self = this;
                var modal = self.modal;
                var modalTitle = '';

                switch (action) {
                    case MODAL_ACTION.ADD_CONTAINER:
                        modalTitle = 'Add container';
                        break;

                    case MODAL_ACTION.ADD_SUB_CONTAINER:
                        modalTitle = 'Add sub-container';
                        break;

                    case MODAL_ACTION.ADD_COMPONENT:
                        modalTitle = 'Add component';
                        break;

                    default:
                    // Do nothing
                }

                modal.find('.keditor-modal-title').html(modalTitle);
                modal.find('.keditor-snippets-wrapper').css('display', 'none');
                modal.find(action === MODAL_ACTION.ADD_COMPONENT ? '.keditor-snippets-wrapper-component' : '.keditor-snippets-wrapper-container').css('display', 'block');

                self.modalTarget = target;
                self.modalAction = action;

                modal.css('display', 'block');
                $(document.body).addClass('opened-modal');
                setTimeout(function () {
                    modal.addClass('showed');
                }, 0);
            }
        }, {
            key: 'closeModal',
            value: function closeModal() {
                var self = this;
                var modal = self.modal;

                self.modalTarget = null;
                self.modalAction = null;
                modal.find('.keditor-modal-title').html('');
                modal.find('.keditor-snippets-wrapper .selected').removeClass('selected');
                modal.removeClass('showed');
            }

            // Content areas
            //---------------------------------

        }, {
            key: 'initContentAreas',
            value: function initContentAreas() {
                flog('initContentAreas');

                var self = this;
                var contentAreasWrapper = self.contentAreasWrapper;
                var options = self.options;

                var contentAreas = void 0;
                if (options.contentAreasSelector) {
                    contentAreas = contentAreasWrapper.find(options.contentAreasSelector);
                }

                if (!contentAreas || contentAreas.length === 0) {
                    flog('Do not find any content area. Creating default content area...');
                    var originalContent = contentAreasWrapper.html();

                    contentAreas = $('<div />').html(originalContent);
                    contentAreasWrapper.empty().append(contentAreas);
                }

                contentAreas.each(function () {
                    var contentArea = $(this);
                    if (!contentArea.attr('id')) {
                        contentArea.attr('id', self.generateId('content-area'));
                    }

                    self.initContentArea(contentArea);
                });
            }
        }, {
            key: 'initContentArea',
            value: function initContentArea(contentArea, dontInitToolbar) {
                flog('initContentArea', contentArea);

                var self = this;
                var options = self.options;

                contentArea.addClass('keditor-content-area');

                if (typeof options.onBeforeInitContentArea === 'function') {
                    options.onBeforeInitContentArea.call(self, contentArea);
                }

                if (!dontInitToolbar) {
                    var contentAreaToolbar = $(self.generateToolbar(TOOLBAR_TYPE.CONTENT_AREA));
                    contentArea.after(contentAreaToolbar);
                    contentAreaToolbar.children('.btn-add-container').on('click', function (e) {
                        e.preventDefault();

                        self.openModal(contentArea, MODAL_ACTION.ADD_CONTAINER);
                    });
                }

                flog('Initialize $.fn.sortable for content area');
                contentArea.sortable({
                    handle: '.keditor-toolbar-container:not(.keditor-toolbar-sub-container) .btn-container-reposition',
                    items: '> section',
                    helper: 'clone',
                    connectWith: '.keditor-content-area',
                    axis: 'y',
                    tolerance: 'pointer',
                    sort: function sort() {
                        $(this).removeClass('ui-state-default');
                    },
                    receive: function receive(event, ui) {
                        flog('On received snippet', event, ui);

                        var helper = ui.helper;
                        var item = ui.item;

                        if (helper) {
                            helper.remove();
                        }

                        self.closeSidebar();

                        if (typeof options.onContentChanged === 'function') {
                            options.onContentChanged.call(self, event, contentArea);
                        }

                        item.addClass('keditor-ui-dragging');
                        contentArea.removeClass('keditor-highlighted-dropzone');
                    },
                    start: function start(e, ui) {
                        ui.item.addClass('keditor-ui-dragging');
                    },
                    stop: function stop(e, ui) {
                        contentArea.removeClass('keditor-highlighted-dropzone');
                        if (ui.helper) {
                            ui.helper.remove();
                        }
                        ui.item.removeClass('keditor-ui-dragging');
                    },
                    over: function over() {
                        contentArea.addClass('keditor-highlighted-dropzone');
                    },
                    out: function out() {
                        contentArea.addClass('keditor-highlighted-dropzone');
                    }
                });

                flog('Initialize existing containers in content area');
                contentArea.children('section').each(function () {
                    self.convertToContainer(contentArea, $(this));
                });

                if (typeof options.onInitContentArea === 'function') {
                    var contentData = options.onInitContentArea.call(self, contentArea);
                    if (contentData && contentData.length > 0) {
                        $.each(contentData, function () {
                            self.convertToContainer(contentArea, $(this));
                        });
                    }
                }
            }

            // Containers
            //---------------------------------

        }, {
            key: 'convertToContainer',
            value: function convertToContainer(contentArea, target) {
                flog('convertToContainer', contentArea, target);

                var self = this;
                var container = void 0;

                if (target.is('section')) {
                    target.addClass('keditor-ui keditor-container');
                    target.wrapInner('<section class="keditor-ui keditor-container-inner"></section>');
                    container = target;
                } else {
                    target.wrap('<section class="keditor-ui keditor-container"><section class="keditor-ui keditor-container-inner"></section></section>');
                    container = target.parent().parent();
                }

                self.initContainer(contentArea, container);
            }
        }, {
            key: 'initContainer',
            value: function initContainer(contentArea, container) {
                var self = this;
                var options = self.options;
                var isNested = options.nestedContainerEnabled && container.closest('[data-type="container-content"]').length > 0;

                flog('initContainer - isNested=' + isNested, contentArea, container);

                if (!container.hasClass('keditor-initialized-container') || !container.hasClass('keditor-initializing-container')) {
                    container.addClass('keditor-initializing-container');

                    if (typeof options.onBeforeInitContainer === 'function') {
                        options.onBeforeInitContainer.call(self, container, contentArea);
                    }

                    if (isNested) {
                        container.addClass('keditor-sub-container');
                    }

                    flog('Render KEditor toolbar for container', container);
                    container.append(self.generateToolbar(isNested ? TOOLBAR_TYPE.SUB_CONTAINER : TOOLBAR_TYPE.CONTAINER));

                    container.attr('id', self.generateId(isNested ? 'sub-container' : 'container'));

                    var containerContents = container.find('[data-type="container-content"]');
                    flog('Initialize ' + containerContents.length + ' container content(s)');
                    containerContents.each(function () {
                        var containerContent = $(this);

                        if (options.nestedContainerEnabled && !isNested && containerContent.parents('[data-type="container-content"]').length > 0) {
                            // Do nothing because it's container content of sub container
                            return;
                        }

                        self.initContainerContent(contentArea, container, containerContent, isNested);
                    });

                    if (typeof options.onInitContainer === 'function') {
                        options.onInitContainer.call(self, container, contentArea);
                    }

                    container.addClass('keditor-initialized-container');
                    container.removeClass('keditor-initializing-container');
                } else {
                    if (container.hasClass('keditor-initialized-container')) {
                        flog('Container is already initialized!');
                    } else {
                        flog('Container is initializing...');
                    }
                }
            }
        }, {
            key: 'initContainerContent',
            value: function initContainerContent(contentArea, container, containerContent, isNested) {
                flog('initContainerContent - isNested=' + isNested, contentArea, container, containerContent);

                var self = this;
                var options = self.options;

                containerContent.addClass('keditor-container-content');
                if (isNested) {
                    containerContent.addClass('keditor-sub-container-content');
                }
                containerContent.attr('id', self.generateId('container-content'));

                var containerContentInner = $('<div class="keditor-container-content-inner"></div>');
                containerContentInner.html(containerContent.html());
                containerContent.html(containerContentInner);

                flog('Initialize toolbar for container content');
                var containerContentToolbar = $(self.generateToolbar(isNested ? TOOLBAR_TYPE.SUB_CONTAINER_CONTENT : TOOLBAR_TYPE.CONTAINER_CONTENT));
                containerContentToolbar.appendTo(containerContent);
                if (!isNested) {
                    containerContentToolbar.children('.btn-add-container').on('click', function (e) {
                        e.preventDefault();

                        self.openModal(containerContentInner, MODAL_ACTION.ADD_SUB_CONTAINER);
                    });
                }
                containerContentToolbar.children('.btn-add-component').on('click', function (e) {
                    e.preventDefault();

                    self.openModal(containerContentInner, MODAL_ACTION.ADD_COMPONENT);
                });

                flog('Initialize $.fn.sortable for container content');
                containerContentInner.sortable({
                    handle: '.btn-component-reposition, .btn-container-reposition',
                    helper: 'clone',
                    items: '> section',
                    connectWith: '.keditor-container-content-inner',
                    tolerance: 'pointer',
                    sort: function sort() {
                        $(this).removeClass('ui-state-default');
                    },
                    receive: function receive(event, ui) {
                        flog('On received snippet', event, ui);

                        var helper = ui.helper;
                        var item = ui.item;
                        var container = void 0;

                        if (helper) {
                            helper.remove();
                        }
                        container = item.closest('.keditor-container');

                        if (!container.hasClass('showed-keditor-toolbar')) {
                            $('.keditor-container.showed-keditor-toolbar').removeClass('showed-keditor-toolbar');
                            container.addClass('showed-keditor-toolbar');
                        }

                        if (typeof options.onContainerChanged === 'function') {
                            options.onContainerChanged.call(self, event, container, contentArea);
                        }

                        if (typeof options.onContentChanged === 'function') {
                            options.onContentChanged.call(self, event, contentArea);
                        }

                        item.removeClass('keditor-ui-dragging');
                        contentArea.removeClass('keditor-highlighted-dropzone');
                    },
                    start: function start(e, ui) {
                        ui.item.addClass('keditor-ui-dragging');
                    },
                    stop: function stop(e, ui) {
                        containerContentInner.removeClass('keditor-highlighted-dropzone');

                        if (ui.helper) {
                            ui.helper.remove();
                        }
                        ui.item.removeClass('keditor-ui-dragging');
                    },
                    over: function over() {
                        containerContentInner.addClass('keditor-highlighted-dropzone');
                    },
                    out: function out() {
                        containerContentInner.removeClass('keditor-highlighted-dropzone');
                    }
                });

                flog('Initialize existing components inside container content');
                containerContentInner.children().each(function () {
                    var child = $(this);

                    if (child.find('[data-type="container-content"]').length > 0) {
                        self.convertToContainer(contentArea, child);
                    } else {
                        self.convertToComponent(contentArea, container, child, true);
                    }
                });
            }

            // Components
            //---------------------------------

        }, {
            key: 'convertToComponent',
            value: function convertToComponent(contentArea, container, target, isExisting) {
                flog('convertToComponent', contentArea, container, target, isExisting);

                if (target.is('.keditor-container-content-toolbar')) {
                    return;
                }

                var self = this;
                var isSection = target.is('section');
                var component = void 0;

                if (isSection) {
                    target.addClass('keditor-ui keditor-component');
                    target.wrapInner('<section class="keditor-ui keditor-component-content"></section>');
                    component = target;
                } else {
                    target.wrap('<section class="keditor-ui keditor-component"><section class="keditor-ui keditor-component-content"></section></section>');
                    component = target.parent().parent();
                }

                if (isExisting) {
                    component.addClass('existing-component');
                }

                self.initComponent(contentArea, container, component);
            }
        }, {
            key: 'initComponent',
            value: function initComponent(contentArea, container, component) {
                flog('initComponent', contentArea, container, component);

                var self = this;
                var options = self.options;
                var body = self.body;

                if (!component.hasClass('keditor-initialized-component') || !component.hasClass('keditor-initializing-component')) {
                    component.addClass('keditor-initializing-component');
                    component.attr('id', self.generateId('component'));

                    if (typeof options.onBeforeInitComponent === 'function') {
                        options.onBeforeInitComponent.call(self, component, contentArea);
                    }

                    var componentContent = component.children('.keditor-component-content');
                    componentContent.attr('id', self.generateId('component-content'));

                    var componentType = self.getComponentType(component);
                    flog('Component type: ' + componentType);

                    var componentData = KEditor.components[componentType];

                    flog('Render KEditor toolbar for component', component);
                    component.append(self.generateToolbar(TOOLBAR_TYPE.COMPONENT, componentData.settingEnabled));

                    component.find('[data-dynamic-href]').each(function () {
                        var dynamicElement = $(this);

                        self.initDynamicContent(dynamicElement);
                    });

                    if (typeof componentData.init === 'function') {
                        componentData.init.call(componentData, contentArea, container, component, self);
                    } else {
                        flog('"init" function of component type "' + componentType + '" does not exist');
                    }

                    if (typeof options.onInitComponent === 'function') {
                        options.onInitComponent.call(self, component, contentArea);
                    }

                    component.addClass('keditor-initialized-component');
                    component.removeClass('keditor-initializing-component');
                } else {
                    if (component.hasClass('keditor-initialized-component')) {
                        flog('Component is already initialized!');
                    } else {
                        flog('Component is initializing...');
                    }
                }
            }
        }, {
            key: 'initDynamicContent',
            value: function initDynamicContent(dynamicElement) {
                flog('initDynamicContent', dynamicElement);

                var self = this;
                var options = self.options;
                var component = dynamicElement.closest('.keditor-component');
                var contentArea = dynamicElement.closest('.keditor-content-area');

                dynamicElement.attr('id', self.generateId('dynamic-element'));

                if (typeof options.onBeforeDynamicContentLoad === 'function') {
                    options.onBeforeDynamicContentLoad.call(self, dynamicElement, component, contentArea);
                }

                var dynamicHref = dynamicElement.attr('data-dynamic-href');
                var data = self.getDataAttributes(component, ['data-type', 'data-dynamic-href'], false);
                data = $.param(data);
                flog('Dynamic href: ' + dynamicHref + ', Data: ' + data);

                return $.ajax({
                    url: dynamicHref,
                    data: data,
                    type: 'GET',
                    dataType: 'HTML',
                    success: function success(response, status, xhr) {
                        flog('Dynamic content is loaded', dynamicElement, response, status, xhr);
                        dynamicElement.html(response);

                        if (typeof options.onDynamicContentLoaded === 'function') {
                            options.onDynamicContentLoaded.call(self, dynamicElement, response, status, xhr, contentArea);
                        }
                    },
                    error: function error(response, status, xhr) {
                        flog('Error when loading dynamic content', dynamicElement, response, status, xhr);

                        if (typeof options.onDynamicContentError === 'function') {
                            options.onDynamicContentError.call(self, dynamicElement, response, status, xhr, contentArea);
                        }
                    }
                });
            }
        }, {
            key: 'deleteComponent',
            value: function deleteComponent(component) {
                flog('deleteComponent', component);

                var self = this;

                var componentType = self.getComponentType(component);
                var componentData = KEditor.components[componentType];
                if (typeof componentData.destroy === 'function') {
                    componentData.destroy.call(componentData, component, self);
                }

                component.remove();
            }

            // Get content
            //---------------------------------

        }, {
            key: 'getComponentContent',
            value: function getComponentContent(component) {
                flog('getComponentContent');

                var self = this;
                var clonedComponent = component.clone();
                var componentType = self.getComponentType(clonedComponent);
                var componentData = KEditor.components[componentType];
                var dataAttributes = self.getDataAttributes(clonedComponent, null, true);
                var content = void 0;

                if (typeof componentData.getContent === 'function') {
                    content = componentData.getContent.call(componentData, clonedComponent, self);
                } else {
                    var componentContent = clonedComponent.children('.keditor-component-content');
                    content = componentContent.html();
                }

                clonedComponent.html(content).find('[data-dynamic-href]').each(function () {
                    $(this).html('');
                });

                return '<section ' + dataAttributes.join(' ') + '>' + clonedComponent.html() + '</section>';
            }
        }, {
            key: 'getContainerContent',
            value: function getContainerContent(container, isNested) {
                flog('getContainerContent - isNested=' + isNested, container);

                var self = this;
                var containerInner = container.children('.keditor-container-inner').clone();

                containerInner.find('[data-type=container-content]').not(isNested ? '' : '.keditor-sub-container-content').each(function () {
                    var containerContent = $(this);
                    containerContent.removeClass('keditor-container-content keditor-sub-container-content').removeAttr('id');

                    var containerContentInner = containerContent.children();
                    var content = '';

                    containerContentInner.children().each(function () {
                        var child = $(this);

                        if (child.is('.keditor-component')) {
                            content += self.getComponentContent(child);
                        } else if (child.is('.keditor-sub-container')) {
                            content += self.getContainerContent(child, true);
                        }
                    });

                    containerContent.html(content);
                });

                return '<section>' + containerInner.html() + '</section>';
            }
        }, {
            key: 'getContent',
            value: function getContent(inArray) {
                var self = this;
                var result = [];

                self.contentAreasWrapper.find('.keditor-content-area').each(function () {
                    var html = '';
                    $(this).children('.keditor-container').each(function () {
                        var container = $(this);

                        html += self.getContainerContent(container);
                    });

                    result.push(html);
                });

                return inArray ? result : result.join('\n');
            }

            // Set content
            //---------------------------------

        }, {
            key: 'setContent',
            value: function setContent(content, contentArea) {
                var self = this;
                var contentAreasWrapper = self.contentAreasWrapper;

                if (!contentArea) {
                    contentArea = contentAreasWrapper.children('.keditor-content-area');
                } else {
                    if (!contentArea.jquery) {
                        contentArea = contentAreasWrapper.find(contentArea);
                    }
                }

                if (contentArea.length === 0) {
                    error('Content area does not exist!');
                }

                contentArea.html(content);
                self.initContentArea(contentArea, true);
            }

            // Destroy
            //---------------------------------

        }, {
            key: 'destroy',
            value: function destroy() {
                var self = this;
                var element = self.element;
                var id = self.id;

                var content = self.getContent(false);

                if (self.options.iframeMode) {
                    self.iframeWrapper.remove();
                } else {
                    self.contentAreasWrapper.remove();
                }

                if (element.is('textarea')) {
                    element.val(content);
                } else {
                    element.html(content);
                }

                element.removeClass('keditor-hidden-element');
                element.data('keditor', null);
                delete KEditor.instances[id];
            }
        }]);

        return KEditor;
    }();

    // KEditor plugins


    $.fn.keditor = function (options) {
        var element = $(this);
        var instance = element.data('keditor');

        if (typeof options === 'string') {
            if (instance && instance[options] && typeof instance[options] === 'function') {
                return instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
            }
        } else {
            if (!instance) {
                instance = new KEditor(element, options);
                element.data('keditor', instance);
            }

            return instance;
        }
    };
    $.fn.keditor.constructor = KEditor;

    // KEditor instances
    KEditor.instances = {};

    // Turn on/off debug mode
    KEditor.debug = false;

    // Version of KEditor
    KEditor.version = '@{version}';

    // Component types
    KEditor.components = {
        blank: {
            settingEnabled: false
        }
    };

    // Export default configuration
    KEditor.DEFAULTS = DEFAULTS;

    // Export log methods;
    KEditor.log = flog;
    KEditor.error = error;

    // Export KEditor
    window.KEditor = $.keditor = KEditor;
})(window, jQuery);