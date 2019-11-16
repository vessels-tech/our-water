"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FirestoreDoc = void 0;

var _Maybe = require("./Maybe");

var _AppProviderTypes = require("./AppProviderTypes");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FirestoreDoc =
/*#__PURE__*/
function () {
  function FirestoreDoc(firestore, orgId, props) {
    _classCallCheck(this, FirestoreDoc);

    _defineProperty(this, "firestore", void 0);

    _defineProperty(this, "props", void 0);

    _defineProperty(this, "docName", undefined);

    this.firestore = firestore;
    this.props = _objectSpread({}, props, {
      orgId: orgId,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined
    });
  }

  _createClass(FirestoreDoc, [{
    key: "create",
    value: function create() {
      if ((0, _Maybe.isUndefined)(this.docName)) {
        throw new Error("called create() on firestoredoc, but docname is undefined.");
      }

      var newRef = this.firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc();
      this.props.id = newRef.id;
      this.props.createdAt = new Date();
      return this.save();
    }
  }, {
    key: "save",
    value: function save(options) {
      var _this = this;

      this.props.updatedAt = new Date();

      if ((0, _Maybe.isUndefined)(this.props.id)) {
        throw new Error("called save() on firestoredoc, but id is undefined.");
      }

      if ((0, _Maybe.isUndefined)(this.docName)) {
        throw new Error("called create() on firestoredoc, but docname is undefined.");
      }

      return this.firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(this.props.id).set(this.serialize(), options).then(function (ref) {
        return (0, _AppProviderTypes.makeSuccess)(_this);
      }).catch(function (err) {
        return (0, _AppProviderTypes.makeError)(err.message);
      });
    }
    /**
     * Create docs as part of a Batch
     * Put in an id, or allow firebase to create one for you.
     */

  }, {
    key: "batchCreate",
    value: function batchCreate(batch, firestore, id) {
      if ((0, _Maybe.isUndefined)(this.docName)) {
        throw new Error("called create() on firestoredoc, but docname is undefined.");
      }

      var ref;

      if (!id) {
        ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc();
        this.props.id = ref.id;
      } else {
        ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(id);
        this.props.id = id;
      }

      this.props.createdAt = new Date();
      this.props.updatedAt = new Date();
      batch.set(ref, this.serialize());
    }
    /**
     * Delete docs as a part of a Batch
     * 
     * If no ID is provided, will use the id of the FirestoreDoc.
     */

  }, {
    key: "batchDelete",
    value: function batchDelete(batch, firestore, id) {
      if ((0, _Maybe.isUndefined)(this.docName)) {
        throw new Error("called create() on firestoredoc, but docname is undefined.");
      }

      if ((0, _Maybe.isUndefined)(this.props.id)) {
        throw new Error("called save() on firestoredoc, but id is undefined.");
      }

      var ref;

      if (!id) {
        ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(this.props.id);
      } else {
        ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(id);
      }

      batch.delete(ref);
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return this.props;
    }
  }, {
    key: "underlyingProps",
    value: function underlyingProps() {
      return this.props;
    } //We use U here as static superclasses can't infer the generic type T

  }], [{
    key: "_get",
    value: function _get(firestore, docName, orgId, id, transform) {
      return firestore.collection('org').doc(orgId).collection(docName).doc(id).get().then(function (sn) {
        var data = sn.data();

        if (!data) {
          throw new Error("Couldn't get model for params: ".concat(docName, ", ").concat(orgId, ", ").concat(id));
        }

        var parsed = transform(data);
        var doc = new FirestoreDoc(firestore, orgId, parsed);
        return (0, _AppProviderTypes.makeSuccess)(doc);
      }).catch(function (err) {
        return (0, _AppProviderTypes.makeError)(err.message);
      });
    }
  }]);

  return FirestoreDoc;
}();

exports.FirestoreDoc = FirestoreDoc;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9GaXJlc3RvcmVEb2MudHMiXSwibmFtZXMiOlsiRmlyZXN0b3JlRG9jIiwiZmlyZXN0b3JlIiwib3JnSWQiLCJwcm9wcyIsInVuZGVmaW5lZCIsImlkIiwiY3JlYXRlZEF0IiwidXBkYXRlZEF0IiwiZG9jTmFtZSIsIkVycm9yIiwibmV3UmVmIiwiY29sbGVjdGlvbiIsImRvYyIsIkRhdGUiLCJzYXZlIiwib3B0aW9ucyIsInNldCIsInNlcmlhbGl6ZSIsInRoZW4iLCJyZWYiLCJjYXRjaCIsImVyciIsIm1lc3NhZ2UiLCJiYXRjaCIsImRlbGV0ZSIsInRyYW5zZm9ybSIsImdldCIsInNuIiwiZGF0YSIsInBhcnNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWNBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFZYUEsWTs7O0FBS1gsd0JBQVlDLFNBQVosRUFBa0NDLEtBQWxDLEVBQWlEQyxLQUFqRCxFQUEyRDtBQUFBOztBQUFBOztBQUFBOztBQUFBLHFDQUZsQ0MsU0FFa0M7O0FBQ3pELFNBQUtILFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsU0FBS0UsS0FBTCxxQkFDS0EsS0FETDtBQUVFRCxNQUFBQSxLQUFLLEVBQUxBLEtBRkY7QUFHRUcsTUFBQUEsRUFBRSxFQUFFRCxTQUhOO0FBSUVFLE1BQUFBLFNBQVMsRUFBRUYsU0FKYjtBQUtFRyxNQUFBQSxTQUFTLEVBQUVIO0FBTGI7QUFPRDs7Ozs2QkFHcUQ7QUFDcEQsVUFBSSx3QkFBWSxLQUFLSSxPQUFqQixDQUFKLEVBQStCO0FBQzdCLGNBQU0sSUFBSUMsS0FBSixDQUFVLDREQUFWLENBQU47QUFDRDs7QUFFRCxVQUFNQyxNQUFNLEdBQUcsS0FBS1QsU0FBTCxDQUFlVSxVQUFmLENBQTBCLEtBQTFCLEVBQWlDQyxHQUFqQyxDQUFxQyxLQUFLVCxLQUFMLENBQVdELEtBQWhELEVBQXVEUyxVQUF2RCxDQUFrRSxLQUFLSCxPQUF2RSxFQUFnRkksR0FBaEYsRUFBZjtBQUNBLFdBQUtULEtB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Q0FBN0I7QUFDQSxlQUFPLG1DQUFZakIsR0FBWixDQUFQO0FBQ0QsT0FUSSxFQVVKUSxLQVZJLENBVUUsVUFBQ0MsR0FBRDtBQUFBLGVBQWdCLGlDQUEyQkEsR0FBRyxDQUFDQyxPQUEvQixDQUFoQjtBQUFBLE9BVkYsQ0FBUDtBQVdEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGaXJlc3RvcmVEb2NcbiAqIFxuICogVGhpcyBpcyBhIHNlY29uZCBwYXNzIGF0IGEga2luZCBvZiBPUk0gZm9yIEZpcmVzdG9yZS5cbiAqIEl0IGhhcyBtYW55IGlzc3VlcywgYW5kIHNvIHNob3VsZG4ndCBiZSB1c2VkIGFzIG9mIHlldCwgXG4gKiBidXQgY2FuIGhvcGVmdWxseSBpbmZvcm0gZnV0dXJlIHdvcmsgaW4gdGhpcyBhcmVhLlxuICogXG4gKiBcbiAqL1xuXG5cbmltcG9ydCAqIGFzIGFkbWluIGZyb20gXCJmaXJlYmFzZS1hZG1pblwiO1xudHlwZSBGaXJlc3RvcmUgPSBhZG1pbi5maXJlc3RvcmUuRmlyZXN0b3JlO1xuaW1wb3J0IHsgRG9jdW1lbnREYXRhLCBEb2N1bWVudFNuYXBzaG90LCBTZXRPcHRpb25zIH0gZnJvbSBcIkBnb29nbGUtY2xvdWQvZmlyZXN0b3JlXCI7XG5pbXBvcnQgeyBNYXliZSwgaXNVbmRlZmluZWQgfSBmcm9tIFwiLi9NYXliZVwiO1xuaW1wb3J0IHsgU29tZVJlc3VsdCwgbWFrZVN1Y2Nlc3MsIG1ha2VFcnJvciB9IGZyb20gXCIuL0FwcFByb3ZpZGVyVHlwZXNcIjtcblxuXG5cbmV4cG9ydCB0eXBlIEZpcmVzdG9yZURvY1R5cGVzID0ge1xuICBvcmdJZDogc3RyaW5nLFxuICBpZDogTWF5YmU8c3RyaW5nPlxuICBjcmVhdGVkQXQ6IE1heWJlPERhdGU+XG4gIHVwZGF0ZWRBdDogTWF5YmU8RGF0ZT4gXG59XG5cblxuZXhwb3J0IGNsYXNzIEZpcmVzdG9yZURvYzxUPiB7XG4gIGZpcmVzdG9yZTogRmlyZXN0b3JlXG4gIHByb3BzOiBUICYgRmlyZXN0b3JlRG9jVHlwZXM7XG4gIGRvY05hbWU6IE1heWJlPHN0cmluZz4gPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoZmlyZXN0b3JlOiBGaXJlc3RvcmUsIG9yZ0lkOiBzdHJpbmcsIHByb3BzOiBUKSB7XG4gICAgdGhpcy5maXJlc3RvcmUgPSBmaXJlc3RvcmU7XG4gICAgdGhpcy5wcm9wcyA9IHtcbiAgICAgIC4uLnByb3BzLFxuICAgICAgb3JnSWQsXG4gICAgICBpZDogdW5kZWZpbmVkLFxuICAgICAgY3JlYXRlZEF0OiB1bmRlZmluZWQsXG4gICAgICB1cGRhdGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9XG4gIH1cblxuXG4gIHB1YmxpYyBjcmVhdGUoKTogUHJvbWlzZTxTb21lUmVzdWx0PEZpcmVzdG9yZURvYzxUPj4+IHtcbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5kb2NOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGVkIGNyZWF0ZSgpIG9uIGZpcmVzdG9yZWRvYywgYnV0IGRvY25hbWUgaXMgdW5kZWZpbmVkLlwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdSZWYgPSB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2ModGhpcy5wcm9wcy5vcmdJZCkuY29sbGVjdGlvbih0aGlzLmRvY05hbWUpLmRvYygpO1xuICAgIHRoaXMucHJvcHMuaWQgPSBuZXdSZWYuaWQ7XG4gICAgdGhpcy5wcm9wcy5jcmVhdGVkQXQgPSBuZXcgRGF0ZSgpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2F2ZSgpO1xuICB9XG5cbiAgcHVibGljIHNhdmUob3B0aW9ucz86IFNldE9wdGlvbnMpOiBQcm9taXNlPFNvbWVSZXN1bHQ8RmlyZXN0b3JlRG9jPFQ+Pj4ge1xuICAgIHRoaXMucHJvcHMudXBkYXRlZEF0ID0gbmV3IERhdGUoKTtcblxuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLnByb3BzLmlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGVkIHNhdmUoKSBvbiBmaXJlc3RvcmVkb2MsIGJ1dCBpZCBpcyB1bmRlZmluZWQuXCIpO1xuICAgIH1cblxuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLmRvY05hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWxsZWQgY3JlYXRlKCkgb24gZmlyZXN0b3JlZG9jLCBidXQgZG9jbmFtZSBpcyB1bmRlZmluZWQuXCIpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpcy5maXJlc3RvcmUuY29sbGVjdGlvbignb3JnJykuZG9jKHRoaXMucHJvcHMub3JnSWQpLmNvbGxlY3Rpb24odGhpcy5kb2NOYW1lKS5kb2ModGhpcy5wcm9wcy5pZClcbiAgICAgIC5zZXQodGhpcy5zZXJpYWxpemUoKSwgb3B0aW9ucylcbiAgICAgIC50aGVuKHJlZiA9PiBtYWtlU3VjY2Vzcyh0aGlzKSlcbiAgICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yKGVyci5tZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGRvY3MgYXMgcGFydCBvZiBhIEJhdGNoXG4gICAqIFB1dCBpbiBhbiBpZCwgb3IgYWxsb3cgZmlyZWJhc2UgdG8gY3JlYXRlIG9uZSBmb3IgeW91LlxuICAgKi9cbiAgcHVibGljIGJhdGNoQ3JlYXRlKGJhdGNoOiBGaXJlYmFzZUZpcmVzdG9yZS5Xcml0ZUJhdGNoLCBmaXJlc3RvcmU6IEZpcmViYXNlRmlyZXN0b3JlLkZpcmVzdG9yZSwgaWQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5kb2NOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGVkIGNyZWF0ZSgpIG9uIGZpcmVzdG9yZWRvYywgYnV0IGRvY25hbWUgaXMgdW5kZWZpbmVkLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgcmVmO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJlZiA9IGZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2ModGhpcy5wcm9wcy5vcmdJZCkuY29sbGVjdGlvbih0aGlzLmRvY05hbWUpLmRvYygpO1xuICAgICAgdGhpcy5wcm9wcy5pZCA9IHJlZi5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmID0gZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ29yZycpLmRvYyh0aGlzLnByb3BzLm9yZ0lkKS5jb2xsZWN0aW9uKHRoaXMuZG9jTmFtZSkuZG9jKGlkKTtcbiAgICAgIHRoaXMucHJvcHMuaWQgPSBpZDtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzLmNyZWF0ZWRBdCA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5wcm9wcy51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpO1xuICAgIGJhdGNoLnNldChyZWYsIHRoaXMuc2VyaWFsaXplKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBkb2NzIGFzIGEgcGFydCBvZiBhIEJhdGNoXG4gICAqIFxuICAgKiBJZiBubyBJRCBpcyBwcm92aWRlZCwgd2lsbCB1c2UgdGhlIGlkIG9mIHRoZSBGaXJlc3RvcmVEb2MuXG4gICAqL1xuICBwdWJsaWMgYmF0Y2hEZWxldGUoYmF0Y2g6IEZpcmViYXNlRmlyZXN0b3JlLldyaXRlQmF0Y2gsIGZpcmVzdG9yZTogRmlyZWJhc2VGaXJlc3RvcmUuRmlyZXN0b3JlLCBpZD86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLmRvY05hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWxsZWQgY3JlYXRlKCkgb24gZmlyZXN0b3JlZG9jLCBidXQgZG9jbmFtZSBpcyB1bmRlZmluZWQuXCIpO1xuICAgIH1cblxuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLnByb3BzLmlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGVkIHNhdmUoKSBvbiBmaXJlc3RvcmVkb2MsIGJ1dCBpZCBpcyB1bmRlZmluZWQuXCIpO1xuICAgIH1cblxuICAgIGxldCByZWY7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmVmID0gZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ29yZycpLmRvYyh0aGlzLnByb3BzLm9yZ0lkKS5jb2xsZWN0aW9uKHRoaXMuZG9jTmFtZSkuZG9jKHRoaXMucHJvcHMuaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWYgPSBmaXJlc3RvcmUuY29sbGVjdGlvbignb3JnJykuZG9jKHRoaXMucHJvcHMub3JnSWQpLmNvbGxlY3Rpb24odGhpcy5kb2NOYW1lKS5kb2MoaWQpO1xuICAgIH1cbiAgICBiYXRjaC5kZWxldGUocmVmKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogRG9jdW1lbnREYXRhIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcztcbiAgfVxuXG4gIHB1YmxpYyB1bmRlcmx5aW5nUHJvcHMoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHM7XG4gIH1cblxuICAvL1dlIHVzZSBVIGhlcmUgYXMgc3RhdGljIHN1cGVyY2xhc3NlcyBjYW4ndCBpbmZlciB0aGUgZ2VuZXJpYyB0eXBlIFRcbiAgcHVibGljIHN0YXRpYyBfZ2V0PFU+KGZpcmVzdG9yZTogRmlyZXN0b3JlLCBkb2NOYW1lOiBzdHJpbmcsIG9yZ0lkOiBzdHJpbmcsIGlkOiBzdHJpbmcsIHRyYW5zZm9ybTogKGRhdGE6IGFueSkgPT4gVSk6IFByb21pc2U8U29tZVJlc3VsdDxGaXJlc3RvcmVEb2M8VT4+PiB7XG5cbiAgICByZXR1cm4gZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ29yZycpLmRvYyhvcmdJZCkuY29sbGVjdGlvbihkb2NOYW1lKS5kb2MoaWQpLmdldCgpXG4gICAgICAudGhlbigoc246IERvY3VtZW50U25hcHNob3QpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHNuLmRhdGEoKTtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZG4ndCBnZXQgbW9kZWwgZm9yIHBhcmFtczogJHtkb2NOYW1lfSwgJHtvcmdJZH0sICR7aWR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkOiBVID0gdHJhbnNmb3JtKGRhdGEpO1xuICAgICAgICBjb25zdCBkb2M6IEZpcmVzdG9yZURvYzxVPiA9IG5ldyBGaXJlc3RvcmVEb2M8VT4oZmlyZXN0b3JlLCBvcmdJZCwgcGFyc2VkKTtcbiAgICAgICAgcmV0dXJuIG1ha2VTdWNjZXNzKGRvYyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnI6IEVycm9yKSA9PiBtYWtlRXJyb3I8RmlyZXN0b3JlRG9jPFU+PihlcnIubWVzc2FnZSkpXG4gIH1cblxufSJdfQ==