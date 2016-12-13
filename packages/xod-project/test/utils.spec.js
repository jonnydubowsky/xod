import { Maybe } from 'ramda-fantasy';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import shortid from 'shortid';

import * as CONST from '../src/constants';
import * as Utils from '../src/utils';

import * as Helper from './helpers';

chai.use(dirtyChai);

describe('Utils', () => {
  describe('getBaseName', () => {
    it('should return base name extracted from path', () => {
      const baseName = 'test';
      const path = `@/folder/${baseName}`;
      const result = Utils.getBaseName(path);
      expect(result).to.be.equal(baseName);
    });
  });

  describe('validatePath', () => {
    it('should be Either.Left for not valid paths', () => {
      const err1 = Utils.validatePath('');
      const err2 = Utils.validatePath('dots.in.names');
      expect(err1.isLeft).to.be.true();
      expect(Utils.validatePath('кириллица').isLeft).to.be.true();
      expect(Utils.validatePath('spa ce').isLeft).to.be.true();
      expect(Utils.validatePath('spçiålÇhÅr$').isLeft).to.be.true();
      expect(err2.isLeft).to.be.true();

      Helper.expectErrorMessage(expect, err1, CONST.ERROR.PATH_INVALID);
      Helper.expectErrorMessage(expect, err2, CONST.ERROR.PATH_INVALID);
    });
    it('should be Either.Right for valid paths', () => {
      expect(Utils.validatePath('@/patchName').isRight).to.be.true();
      expect(Utils.validatePath('@/folder/subfolder/patchName').isRight).to.be.true();
      expect(Utils.validatePath('@/folder_underscored/patch_name_underscored').isRight).to.be.true();
      expect(Utils.validatePath('@/folder-dashed/patch-name-dashed').isRight).to.be.true();
      expect(Utils.validatePath('not/a/local/patchName').isRight).to.be.true();
      expect(Utils.validatePath('not/a/local/patch-name-dashed').isRight).to.be.true();
      expect(Utils.validatePath('not/a/local/patch_name_underscored').isRight).to.be.true();
    });
    it('should be Either.Right should containt correct value', () => {
      const path = '@/folder/subFolder/patchName';
      const result = Utils.validatePath(path);
      expect(result.isRight).to.be.true();

      /* istanbul ignore next */
      Helper.expectEither(
        val => { expect(val).to.be.equal(path); },
        result
      );
    });
  });

  // etc
  describe('assocRight', () => {
    const testObj = Utils.assocRight('test', 'testVal', {});

    it('should return Either.Right', () => {
      expect(testObj.isRight).to.be.true();
    });
    it('should contain object with new assigned value', () => {
      /* istanbul ignore next */
      Helper.expectEither(
        val => {
          expect(val)
            .to.have.property('test')
            .that.equals('testVal');
        },
        testObj
      );
    });
  });
  describe('leaveError', () => {
    const errMsg = 'error message';
    const testObj = Utils.leaveError(errMsg)();

    it('should return Either.Left', () => {
      expect(testObj.isLeft).to.be.true();
    });
    it('should contain Error', () => {
      /* istanbul ignore next */
      testObj.chain(val => {
        expect(val)
          .to.be.an.instanceof(Error)
          .and.equal('testVal')
          .and.have.property('message')
          .that.equal(errMsg);
      });
    });
  });

  describe('isPathLocal', () => {
    const localPath = '@/test';
    const libPath = 'vasya/superLibraru/test';

    it('should return true for localPath', () => {
      const result = Utils.isPathLocal(localPath);
      expect(result).to.be.true();
    });
    it('should return false for not a patch', () => {
      const result = Utils.isPathLocal({});
      expect(result).to.be.false();
    });
    it('should return false for libPath', () => {
      const result = Utils.isPathLocal(libPath);
      expect(result).to.be.false();
    });
  });
  describe('isPathLibrary', () => {
    const localPath = '@/test';
    const libPath = 'vasya/superLibraru/test';

    it('should return true for libPath', () => {
      const result = Utils.isPathLibrary(libPath);
      expect(result).to.be.true();
    });
    it('should return false for not a patch', () => {
      const result = Utils.isPathLocal({});
      expect(result).to.be.false();
    });
    it('should return false for localPath', () => {
      const result = Utils.isPathLibrary(localPath);
      expect(result).to.be.false();
    });
  });

  describe('generateId', () => {
    it('should be valid shortid', () => {
      const id = Utils.generateId();
      expect(shortid.isValid(id)).to.be.true();
    });
  });

  describe('maybeToEither', () => {
    it('should return Either.Left for Maybe.Nothing', () => {
      const errMessage = 'test passed';
      const nothing = Maybe.Nothing(); // eslint-disable-line new-cap
      const either = Utils.maybeToEither(errMessage, nothing);
      expect(either.isLeft).to.be.true();
      Helper.expectErrorMessage(expect, either, errMessage);
    });
    it('should return Either.Right for Maybe.Just', () => {
      const content = {};
      const just = Maybe.of(content);
      const either = Utils.maybeToEither({}, just);
      expect(either.isRight).to.be.true();
      Helper.expectEither(
        val => expect(val).to.be.equal(content),
        either
      );
    });
  });
});
