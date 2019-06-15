import CLASS_NAMES from './constants/classNames';

export default function (content, contentArea) {
    let self = this;
    let contentAreasWrapper = self.wrapper;
    
    if (!contentArea) {
        contentArea = contentAreasWrapper.children(`.${CLASS_NAMES.CONTENT_AREA}`);
    } else {
        if (!contentArea.jquery) {
            contentArea = contentAreasWrapper.find(contentArea);
        }
    }
    
    if (contentArea.length === 0) {
        self.error('Content area does not exist!');
    }
    
    contentArea.html(content);
    self.initContentArea(contentArea, true);
};
