import { INPUT_TYPES, GALLERY_CONSTS } from '../utils/constants';
import { createOptions } from '../utils/utils';

export default {
  title: 'Choose info layout',
  description: `Choose the layout you want for your texts, you can choose to separate the texts and the items
  so you can style them separately.`,
  isRelevant: (styleParams) => (styleParams.allowTitle || styleParams.allowDescription) &&
  styleParams.groupSize === 1 && styleParams.isVertical &&
  styleParams.titlePlacement !== GALLERY_CONSTS.PLACEMENTS.SHOW_ON_HOVER,
  options: createOptions('INFO_TYPE'),
  type: INPUT_TYPES.OPTIONS,
  default: GALLERY_CONSTS.INFO_TYPE.NO_BACKGROUND,
}
