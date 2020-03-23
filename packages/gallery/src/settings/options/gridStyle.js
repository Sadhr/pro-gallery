import { GALLERY_CONSTS, INPUT_TYPES } from '../utils/constants';
import { createOptions } from '../utils/utils';

export default {
  title: 'Responsive Type',
  isRelevant: (styleParams)  => styleParams.isVertical,
  type: INPUT_TYPES.OPTIONS,
  default: GALLERY_CONSTS.GRID_STYLE.FIT_TO_SCREEN,
  options: createOptions('GRID_STYLE'),
  description: `Choose between adjusting the number of columns addording to the container
  size or setting it manualyand keep it fixed.
  `,
}
